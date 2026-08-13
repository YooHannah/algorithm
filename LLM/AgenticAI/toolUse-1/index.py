# 练习在llm 中使用tools 相当于fucntion calling

import json
import os
import display_functions
from dotenv import load_dotenv
_ = load_dotenv()

import aisuite as ai

# Create an instance of the AISuite client
ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_API_BASE = os.getenv("ARK_API_BASE")
ARK_MODEL_NAME = os.getenv("ARK_MODEL_NAME")

client = ai.Client({
    "openai": {
            "api_key": ARK_API_KEY,
            "base_url": ARK_API_BASE,
        }
})

from datetime import datetime

def get_current_time():
    """
    Returns the current time as a string.
    """
    return datetime.now().strftime("%H:%M:%S")

# Message structure
prompt = "What time is it?"
messages = [
    {
        "role": "user",
        "content": prompt,
    }
]

response = client.chat.completions.create(
    model="openai:" + ARK_MODEL_NAME,
    messages=messages,
    tools=[get_current_time],
    max_turns=5
)

# # See the LLM response
print(response.choices[0].message.content)
# print('fire1 -------',  response)


# display_functions.pretty_print_chat_completion(response)

# ---------------schema 注册tool 手动调用 function 再将结果塞回 response -----------------
# pip install 'aisuite[mcp]'
# 注册tool
tools = [{
    "type": "function",
    "function": {
        "name": "get_current_time", # <--- Your functions name
        "description": "Returns the current time as a string.", # <--- a description for the LLM
        "parameters": {}
    }
}]

response = client.chat.completions.create(
    model="openai:" + ARK_MODEL_NAME,
    messages=messages,
    tools=tools, # <-- Your list of tools with get_current_time
    # max_turns=5 # <-- When defining tools manually, you must handle calls yourself and cannot use max_turns
)

# print(json.dumps(response.model_dump(), indent=2, default=str))

# print('fire1 -------',  response.choices[0].message.tool_calls)

# 将tool 的返回值重新以message 返回给LLM

response2 = None
# 用doubao 实际测试发现注册的tool 不会在tool_calls 中返回
# Create a condition in case tool_calls is in response object
if response.choices[0].message.tool_calls:
    # Pull out the specific tool metadata from the response
    tool_call = response.choices[0].message.tool_calls[0]
    args = json.loads(tool_call.function.arguments)

    # Run the tool locally
    tool_result = get_current_time()

    # Append the result to the messages list
    messages.append(response.choices[0].message)
    messages.append({
        "role": "tool", "tool_call_id": tool_call.id, "content": str(tool_result)
    })

    # Send the list of messages with the newly appended results back to the LLM
    response2 = client.chat.completions.create(
        model="openai:" + ARK_MODEL_NAME,
        messages=messages,
        tools=tools,
    )

    print('fire2 -------', response2.choices[0].message.content)


# ----------------- more tools llm 会自行决定调用哪个tool -----------------
import requests
import qrcode
from qrcode.image.styledpil import StyledPilImage


def get_weather_from_ip():
    """
    Gets the current, high, and low temperature in Fahrenheit for the user's
    location and returns it to the user.
    """
    # Get location coordinates from the IP address
    lat, lon = requests.get('https://ipinfo.io/json').json()['loc'].split(',')

    # Set parameters for the weather API call
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m",
        "daily": "temperature_2m_max,temperature_2m_min",
        "temperature_unit": "fahrenheit",
        "timezone": "auto"
    }

    # Get weather data
    weather_data = requests.get("https://api.open-meteo.com/v1/forecast", params=params).json()

    # Format and return the simplified string
    return (
        f"Current: {weather_data['current']['temperature_2m']}°F, "
        f"High: {weather_data['daily']['temperature_2m_max'][0]}°F, "
        f"Low: {weather_data['daily']['temperature_2m_min'][0]}°F"
    )

# Write a text file
def write_txt_file(file_path: str, content: str):
    """
    Write a string into a .txt file (overwrites if exists).
    Args:
        file_path (str): Destination path.
        content (str): Text to write.
    Returns:
        str: Path to the written file.
    """
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    return file_path


# Create a QR code
def generate_qr_code(data: str, filename: str, image_path: str):
    """Generate a QR code image given data and an image path.

    Args:
        data: Text or URL to encode
        filename: Name for the output PNG file (without extension)
        image_path: Path to the image to be used in the QR code
    """
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
    qr.add_data(data)

    img = qr.make_image(image_factory=StyledPilImage, embedded_image_path=image_path)
    output_file = f"{filename}.png"
    img.save(output_file)

    return f"QR code saved as {output_file} containing: {data[:50]}..."

# prompt = "Can you get the weather for my location?"
prompt = "Can you make a QR code for me using my company's logo that goes to www.deeplearning.ai? The logo is located at `dl_logo.jpg`. You can call it dl_qr_code."
# prompt = "Can you make a txt note for me called reminders.txt that reminds me to call Daniel tomorrow at 7PM?"


response = client.chat.completions.create(
    model="openai:" + ARK_MODEL_NAME,
    messages=[{"role": "user", "content": (
        prompt
    )}],
    tools=[
        get_current_time,
        get_weather_from_ip,
        write_txt_file,
        generate_qr_code
    ],
    max_turns=5
)

print('fire3 -------', response.choices[0].message.content)
print('fire4 -------',  response.choices[0].message.tool_calls)