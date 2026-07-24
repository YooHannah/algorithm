import os
import socket
import subprocess
import threading
import time
import warnings
import urllib.error
import urllib.request

from dotenv import load_dotenv, find_dotenv

# Suppress noisy warnings from libraries (experimental tags, deprecations, etc.)
warnings.filterwarnings("ignore")


# ── API key helpers ──────────────────────────────────────────────────


def load_env():
    _ = load_dotenv(find_dotenv())


def get_openai_api_key():
    load_env()
    return os.getenv("OPENAI_API_KEY")


def get_gemini_api_key():
    load_env()
    return os.getenv("GOOGLE_API_KEY")


def load_api_keys():
    """Load API keys from .env and set them in os.environ."""
    load_env()
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key
        print("✓ OpenAI API key loaded")
    else:
        print("⚠ OPENAI_API_KEY not found — check your .env file")

    gemini_key = os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        os.environ["GOOGLE_API_KEY"] = gemini_key
        print("✓ Google API key loaded")
    else:
        print("ℹ GOOGLE_API_KEY not set (only needed for bonus sections)")


# ── Port scheme ──────────────────────────────────────────────────────
# Each lesson gets dedicated ports:
#   Lesson N → frontend = 3000+N, runtime = 4000+N, backend = 8000+N
# Allowed: 3002–3006 (frontend), 4002–4006 (runtime), 8002–8006 (backend)


def get_ports(lesson: int) -> dict:
    """Return port config for a lesson number (2–6)."""
    return {
        "frontend": 3000 + lesson,
        "backend": 8000 + lesson,
        "runtime": 4000 + lesson,
    }


# ── Server helpers ───────────────────────────────────────────────────

_servers: dict = {}   # port → uvicorn.Server (backends we started)
_frontends: dict = {} # port → subprocess.Popen  (frontends we started)


def _kill_port(port):
    """Kill any process currently listening on *port*."""
    # Try lsof (macOS, full Linux)
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"], capture_output=True, text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            for pid in result.stdout.strip().split():
                try:
                    os.kill(int(pid), 9)
                except OSError:
                    pass
            return
    except FileNotFoundError:
        pass

    # Fallback: parse /proc/net/tcp to find PIDs (works on any Linux)
    try:
        hex_port = f"{port:04X}"
        with open("/proc/net/tcp") as f:
            for line in f:
                parts = line.split()
                if len(parts) < 10:
                    continue
                local = parts[1]
                if local.endswith(f":{hex_port}"):
                    inode = parts[9]
                    # Find the PID that owns this inode
                    for pid_dir in os.listdir("/proc"):
                        if not pid_dir.isdigit():
                            continue
                        try:
                            fd_dir = f"/proc/{pid_dir}/fd"
                            for fd in os.listdir(fd_dir):
                                link = os.readlink(f"{fd_dir}/{fd}")
                                if f"socket:[{inode}]" in link:
                                    os.kill(int(pid_dir), 9)
                                    return
                        except (OSError, PermissionError):
                            continue
    except (FileNotFoundError, PermissionError):
        pass


def is_port_in_use(port):
    """Return True if something is already listening on *port*."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        return s.connect_ex(("127.0.0.1", port)) == 0


def wait_for_port(port, timeout=15):
    """Block until *port* accepts connections (or *timeout* expires)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if is_port_in_use(port):
            return True
        time.sleep(0.5)
    return False

# def wait_for_http(
#     port: int, path: str = "/", timeout: int = 30
# ) -> bool:
#     """Block until HTTP GET on `port` returns <400 (or timeout expires).

#     More reliable than wait_for_port for dev servers — TCP accept can
#     succeed before the app is actually serving requests.
#     """
#     deadline = time.time() + timeout
#     url = f"http://127.0.0.1:{port}{path}"
#     while time.time() < deadline:
#         try:
#             with urllib.request.urlopen(url, timeout=2) as r:
#                 if r.status < 400:
#                     return True
#         except (urllib.error.URLError, OSError):
#             pass
#         time.sleep(0.5)
#     return False
def wait_for_http(
    port: int, path: str = "/", timeout: int = 30
    ) -> bool:
    """Block until HTTP GET on `port` returns a response (or timeout)."""
    deadline = time.time() + timeout
    url = f"http://127.0.0.1:{port}{path}"
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status < 400:
                    return True
        except urllib.error.HTTPError:
            # Server responded with 4xx/5xx — service is up and serving
            return True
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(0.5)
    return False

def _wait_for_port_free(port, timeout=5):
    """Block until *port* is no longer in use (or *timeout* expires)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if not is_port_in_use(port):
            return True
        time.sleep(0.3)
    return False

def _ensure_port_free(port: int) -> None:
    """Free `port` whether or not we started the process on it.

    Handles three cases:
    1. We started a uvicorn server here in this kernel session
    2. We started a frontend subprocess here in this kernel session
    3. Some other process holds the port (e.g., survived a kernel restart)
    """
    if port in _servers:
        _servers[port].should_exit = True
        del _servers[port]
    if port in _frontends:
        proc = _frontends[port]
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
        del _frontends[port]
    if is_port_in_use(port):
        _kill_port(port)
        _wait_for_port_free(port, timeout=5)

def warmup_agent(runtime_port: int, timeout: int = 30) -> None:
    """Send a throwaway request to wake the agent before the UI loads.

    CopilotKit's first agent call sometimes 500s on cold start; warming
    it prevents the user-facing 'Agent not found' error.
    """
    import json

    url = (
        f"http://127.0.0.1:{runtime_port}"
        f"/api/copilotkit/agent/default/connect"
    )
    payload = json.dumps({"messages": []}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(req, timeout=5):
                return
        except urllib.error.HTTPError as e:
            # Any HTTP response means the agent ran — warmup succeeded
            if e.code < 500:
                return
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(1)

def start_server(app, port):
    """Run a FastAPI/uvicorn app in a background thread. Safe to re-run."""
    import uvicorn

    # if port in _servers:
    #     _servers[port].should_exit = True
    #     _wait_for_port_free(port)
    _ensure_port_free(port)

    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="warning")
    server = uvicorn.Server(config)
    _servers[port] = server

    threading.Thread(target=server.run, daemon=True).start()

    if wait_for_port(port):
        print(f"✓ Server running at http://localhost:{port}")
    else:
        print(f"⚠ Server may not have started — check for errors above")


def _node_env():
    """Return an env dict with nvm's Node on PATH (if installed).

    The Jupyter kernel inherits a fixed PATH that may point at a system Node
    that is too old.  This finds the nvm-installed version directly on disk
    and prepends its bin dir to PATH — no shell sourcing required.
    """
    env = os.environ.copy()
    nvm_dir = env.get("NVM_DIR", os.path.expanduser("~/.nvm"))
    versions_dir = os.path.join(nvm_dir, "versions", "node")
    if not os.path.isdir(versions_dir):
        return env

    # Read the default alias to find the preferred version
    alias_file = os.path.join(nvm_dir, "alias", "default")
    target = None
    if os.path.isfile(alias_file):
        with open(alias_file) as f:
            alias = f.read().strip()          # e.g. "20" or "v20.11.0" or "lts/iron"
        # Match installed versions against the alias prefix
        installed = sorted(os.listdir(versions_dir), reverse=True)
        prefix = alias.lstrip("v")
        for v in installed:
            if v.lstrip("v").startswith(prefix):
                target = v
                break

    if target is None:
        # Fall back to the latest installed version
        installed = sorted(os.listdir(versions_dir), reverse=True)
        target = installed[0] if installed else None

    if target:
        node_bin = os.path.join(versions_dir, target, "bin")
        if os.path.isdir(node_bin):
            env["PATH"] = f"{node_bin}:{env.get('PATH', '')}"

    return env


def install_frontend(frontend_dir="frontend"):
    """Install frontend npm dependencies using the correct Node version."""
    frontend_dir = os.path.join(os.getcwd(), frontend_dir)
    env = _node_env()

    print("Installing frontend dependencies ...")
    proc = subprocess.Popen(
        ["npm", "install"],
        cwd=frontend_dir, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True,
    )
    for line in proc.stdout:
        print(line, end="", flush=True)
    proc.wait()
    if proc.returncode != 0:
        raise subprocess.CalledProcessError(proc.returncode, ["npm", "install"])

    print("✓ Frontend dependencies installed")


def start_frontend(port, frontend_dir="frontend"):
    """Start the frontend dev server. Installs deps if needed. Safe to re-run."""
    frontend_dir = os.path.join(os.getcwd(), frontend_dir)
    env = _node_env()
    is_vite = os.path.isfile(os.path.join(frontend_dir, "vite.config.ts"))
    runtime_port = (port + 1000) if is_vite else None

    _ensure_port_free(port)
    if runtime_port:
        _ensure_port_free(runtime_port)

    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        install_frontend(frontend_dir=os.path.basename(frontend_dir))

    # log_path = os.path.join(frontend_dir, "dev-logs.txt")
    # log_file = open(log_path, "w")
    # proc = subprocess.Popen(
    #     ["npm", "run", "dev", "--", "--port", str(port)],
    #     cwd=frontend_dir,
    #     env=env,
    #     stdout=log_file,
    #     stderr=subprocess.STDOUT,
    # )
    # _frontends[port] = proc
    log_path = os.path.join(frontend_dir, "dev-logs.txt")
    log_file = open(log_path, "w")
    proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", str(port)],
        cwd=frontend_dir,
        env=env,
        stdout=log_file,
        stderr=subprocess.STDOUT,
    )
    log_file.close()  # child keeps its own FD; parent doesn't need it
    _frontends[port] = proc

    print(f"Starting frontend on port {port} ...")

    vite_ok = wait_for_port(port, timeout=30)
    runtime_ok = wait_for_port(runtime_port, timeout=30) if runtime_port else True

    if vite_ok and runtime_ok:
        print(f"✓ App running at {get_app_url(port)}")
    elif proc.poll() is not None:
        print(f"✗ Frontend failed to start (exit code {proc.returncode})")
    else:
        if not vite_ok:
            print(f"⚠ Vite may still be starting on port {port}")
        if runtime_port and not runtime_ok:
            print(f"⚠ CopilotKit runtime may still be starting on port {runtime_port}")

    print(f"\nRead the logs: {log_path}")


def reset_lesson(lesson: int):
    """Kill all ports for a lesson and restore its files to their git state."""
    ports = get_ports(lesson)

    # Kill all three ports (frontend, backend, runtime)
    for name, port in ports.items():
        if port in _servers:
            _servers[port].should_exit = True
            del _servers[port]
        if port in _frontends:
            proc = _frontends[port]
            if proc.poll() is None:
                proc.terminate()
            del _frontends[port]
        if is_port_in_use(port):
            _kill_port(port)

    # Restore frontend and backend files to their last-committed state
    repo = os.path.expanduser("~/SC-CopilotKit-C1")
    paths = []
    for subdir in ["frontend", "backend"]:
        if os.path.isdir(os.path.join(repo, f"L{lesson}", subdir)):
            paths.append(f"L{lesson}/{subdir}")
    # if paths:
    #     subprocess.run(
    #         ["git", "checkout", "--"] + paths,
    #         cwd=repo,
    #         capture_output=True,
    #     )

    if paths:
        result = subprocess.run(
            ["git", "checkout", "--"] + paths,
            cwd=repo,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"⚠ Git checkout failed: {result.stderr.strip()}")

    print(f"✓ Lesson {lesson} reset (ports killed, files restored)")


def get_app_url(port):
    """Return the accessible URL for the running app.

    On the DeepLearning.AI platform, uses the reverse-proxy domain.
    Locally, returns http://localhost:<port>.
    """
    hostname = os.environ.get("HOSTNAME", "")
    base_domain = os.environ.get("REV_PROXY_BASE_DOMAIN", "")
    if hostname and base_domain:
        ip = hostname.split(".")[0].removeprefix("ip-")
        return base_domain.format(ip=ip, port=port)
    return f"http://localhost:{port}"

# def display_app(
#     port: int, width: str = "100%", height: int = 700
#     ) -> None:
#     """Show the running app inline after both ports are ready."""
#     from IPython.display import IFrame, clear_output, display

#     runtime_port = port + 1000
#     print(f"⏳ Waiting for app on port {port}...", flush=True)
#     app_ok = wait_for_http(port, timeout=30)
#     print(
#         f"⏳ Waiting for runtime on port {runtime_port}...", flush=True
#     )
#     runtime_ok = wait_for_port(runtime_port, timeout=30)

#     clear_output(wait=True)
#     if not app_ok:
#         print(f"⚠ App on port {port} didn't respond in 30s")
#     if not runtime_ok:
#         print(
#             f"⚠ Runtime on port {runtime_port} didn't respond in 30s"
#         )
#     display(IFrame(src=get_app_url(port), width=width, height=height))

# def display_app(
#     port: int, width: str = "100%", height: int = 700
# ) -> None:
#     """Show the running app inline after frontend + agent are ready."""
#     from IPython.display import IFrame, clear_output, display

#     runtime_port = port + 1000
#     print(f"⏳ Waiting for app on port {port}...", flush=True)
#     app_ok = wait_for_http(port, timeout=30)
#     print(
#         f"⏳ Waiting for agent on port {runtime_port}...", flush=True
#     )
#     time.sleep(2)
#     agent_ok = wait_for_http(
#         runtime_port, path="/api/copilotkit/info", timeout=30
#     )
#     if agent_ok:
#         print("⏳ Warming up agent...", flush=True)
#         warmup_agent(runtime_port)

#     clear_output(wait=True)
#     if not app_ok:
#         print(f"⚠ App on port {port} didn't respond in 30s")
#     if not agent_ok:
#         print(f"⚠ Agent on port {runtime_port} didn't register in 30s")
#     display(IFrame(src=get_app_url(port), width=width, height=height))

def _wait_for_http(port, path="/", timeout=30):
    """Block until HTTP GET on `port` returns a response (or timeout)."""
    import urllib.error
    import urllib.request

    deadline = time.time() + timeout
    url = f"http://127.0.0.1:{port}{path}"
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status < 400:
                    return True
        except urllib.error.HTTPError:
            return True
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(0.5)
    return False


def _wait_for_runtime_settle(runtime_port, settle_time=3, timeout=45):
    """Wait for the runtime to be stably up (survives any pending restart).

    Checks the runtime, waits settle_time, checks again. If the second
    check fails (server died from a watchFile restart), loops back and
    waits for the new server to come up.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        remaining = deadline - time.time()
        if remaining <= 0:
            break
        if not _wait_for_http(runtime_port, "/api/copilotkit/info",
                              timeout=min(10, remaining)):
            time.sleep(1)
            continue
        time.sleep(settle_time)
        if time.time() > deadline:
            break
        if _wait_for_http(runtime_port, "/api/copilotkit/info", timeout=5):
            return True
    return False


def _warmup_agent(runtime_port, timeout=30):
    """Send a throwaway request to wake the agent before the UI loads."""
    import json
    import urllib.error
    import urllib.request

    url = (
        f"http://127.0.0.1:{runtime_port}"
        f"/api/copilotkit/agent/default/connect"
    )
    payload = json.dumps({"messages": []}).encode()
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(req, timeout=5):
                return
        except urllib.error.HTTPError as e:
            if e.code < 500:
                return
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(1)


def display_app(port, width="100%", height=700):
    """Show the running app inline after frontend + agent are ready."""
    from IPython.display import IFrame, clear_output, display

    runtime_port = port + 1000

    print(f"⏳ Waiting for app on port {port}...", flush=True)
    app_ok = _wait_for_http(port, timeout=30)

    print(f"⏳ Waiting for agent on port {runtime_port}...", flush=True)
    agent_ok = _wait_for_runtime_settle(runtime_port)

    if agent_ok:
        print("⏳ Warming up agent...", flush=True)
        _warmup_agent(runtime_port)

    clear_output(wait=True)
    if not app_ok:
        print(f"⚠ App on port {port} didn't respond in 30s")
    if not agent_ok:
        print(f"⚠ Agent on port {runtime_port} didn't register")
    display(IFrame(src=get_app_url(port), width=width, height=height))