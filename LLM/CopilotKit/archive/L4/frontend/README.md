# Lesson 4 Dynamic Frontend

Independent frontend for Lesson 4 dynamic declarative UI.

## Run

```bash
cd L4/frontend-dynamic
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Make sure `L4/backend-dynamic` is running on port `8000`.

## E2E

```bash
cd L4/frontend-dynamic
npm run test:e2e -- e2e/lesson4-frontend.spec.ts
```

# 声明生成式UI
## What is Declarative Generative UI?
Declarative Generative UI lets you define a set of UI building blocks that the agent composes into interfaces. It selects components from a catalog, arranges them into a schema, and binds runtime data to fill in the result.

Three pieces make this work:
* **Component catalog**: the UI primitives your app supports, split into two parts:
  * **Definitions**: platform-agnostic descriptions of each component's name, props, and purpose.
  * **Renderers**: platform-specific implementations that turn definitions into actual UI (e.g. React components).
* **Schema**: the structured description of which components to use, how they nest, and how they relate.
* **Data bindings**: the runtime values that populate the schema with real content like flight details, metrics, or records.

A useful mental model is Lego: the **catalog** is the box of pieces, the **schema** is how they snap together, and the **data bindings** fill in the final details at runtime. The agent assembles interfaces dynamically while your app keeps control over consistency, safety, and rendering quality.


## Why use Declarative Generative UI?
Controlled Generative UI (L3) works well for your highest-traffic surfaces where predictability matters most. But in the long tail (internal tools, edge cases, varied user goals), hand-authoring every layout doesn't scale. That's where Declarative Generative UI fits: the agent assembles UI from a fixed set of building blocks, so you get adaptability without sacrificing safety or consistency.

**Pros**
- **Constrained flexibility:** the agent adapts the interface without going outside your component system.
- **Bring your own components:** you define the primitives, the agent decides how to combine them.
- **Less work per surface:** define the catalog once, reuse it everywhere.
- **Cross-platform by design:** the same schema renders across web, mobile, Slack, and text messaging.
- **More token-efficient than open generative UI:** the agent works from a fixed vocabulary instead of generating arbitrary code.

**Cons**
- **Less pixel-perfect control:** you can't fine-tune the exact final interface.
- **Less predictable:** the agent may assemble components differently in similar situations.
- **More error-prone:** schemas and data bindings can fail in subtle ways, requiring validation and recovery logic.
- **Requires upfront design:** the component catalog, schema format, and renderer contracts need careful definition.

为什么使用声明式生成式用户界面？¶
Controlled Generative UI (L3) works well for your highest-traffic surfaces where predictability matters most. But in the long tail (internal tools, edge cases, varied user goals), hand-authoring every layout doesn't scale. That's where Declarative Generative UI fits: the agent assembles UI from a fixed set of building blocks, so you get adaptability without sacrificing safety or consistency.
受控生成式用户界面（L3）非常适合那些流量最大的界面，因为在这些场景中，可预测性至关重要。但在其他情况下，比如内部工具、特殊案例或多样化的用户需求方面，手动设计每一个界面显然难以扩展。这就是描述性生成式用户界面的优势所在：该工具能够基于固定的构建模块来生成用户界面，从而在不影响安全性或一致性的前提下实现灵活性的提升。

Pros  优点

Constrained flexibility: the agent adapts the interface without going outside your component system.
有限的灵活性：该代理可以在不超出您的组件系统范围的情况下调整界面。
Bring your own components: you define the primitives, the agent decides how to combine them.
自带组件吧：由你来定义基本元素，而代理则负责决定如何将这些元素组合在一起。
Less work per surface: define the catalog once, reuse it everywhere.
每个区域所需的工作量更少：只需定义一次目录，就可以在多个地方重复使用。
Cross-platform by design: the same schema renders across web, mobile, Slack, and text messaging.
设计为跨平台使用：相同的架构可以在网页、移动设备、Slack 聊天应用以及短信通信中正常运行。
More token-efficient than open generative UI: the agent works from a fixed vocabulary instead of generating arbitrary code.
比开放式的生成式 UI 更节省资源：该代理使用的是固定词汇表，而不是生成随机代码。
Cons  消费

Less pixel-perfect control: you can't fine-tune the exact final interface.
需要减少对像素的完美控制：无法对最终界面进行精确的微调。
Less predictable: the agent may assemble components differently in similar situations.
更不可预测：在类似的情况下，代理人可能会以不同的方式组合组件。
More error-prone: schemas and data bindings can fail in subtle ways, requiring validation and recovery logic.
更容易出现错误：模式和数据绑定可能会出现微妙的问题，因此需要进行验证和恢复处理。
Requires upfront design: the component catalog, schema format, and renderer contracts need careful definition.
需要预先进行设计规划：组件目录、模式格式以及渲染器的接口定义都需要仔细制定。

您可以启用 A2UI 的生成功能。当启用 A2UI 后，CopilotKit 会自动添加生成结构化 A2UI 输出所需的后端逻辑——您无需手动实现这一流程。

Under the hood, this works through two layers of tool calls:
在底层，这一操作是通过两层工具调用来实现的：

An outer tool call fires when the agent decides to generate A2UI — this keeps A2UI-specific logic separate from the rest of the agent's behavior.
当代理决定生成 A2UI 时，会触发一个外部工具调用。这样就能将与 A2UI 相关的逻辑与其他代理行为分离开来。
An inner tool call contains the structured A2UI payload. The middleware intercepts these arguments to enable streaming.
一个内部工具调用包含了结构化的 A2UI 负载。中间件会拦截这些参数，以实现流处理功能。
The generated output is also included in the agent history as a tool call result.
生成的输出结果也被记录在了代理的历史记录中，作为工具调用的结果之一。


## fixed schema declarative generative UI.

With a fixed schema, you design the A2UI component tree ahead of time — the layout, nesting, and data bindings are all predefined. The agent's only job is to fill in the runtime data. This gives you maximum control over the final UI while still letting the agent drive when and what data to show.

This is useful when you want a consistent, polished layout for a specific surface (e.g. a flight card carousel) and don't need the agent to improvise the structure.

The easiest way to build a fixed schema is to use the [A2UI Composer](https://a2ui-editor.ag-ui.com/). Open the Composer and specify the following prompt

### Dynamic vs Fixed: When to use which

| | **Fixed Schema** | **Dynamic Schema** |
|---|---|---|
| **Layout** | Predefined, identical every time 预先定义好的，每次都是相同的 | Agent-generated, varies per request由代理生成，随每个请求而不同 |
| **Agent's role** | Fills in data only 仅填充数据 | Chooses components and layout 选择了组件和布局方式 |
| **Consistency 一致性** | Maximum最大值 | Varies 各不相同 |
| **Flexibility 灵活性** | Minimal — new layouts require code changes 非常少——新的布局需要修改代码 | High — agent adapts to the request 高——代理人能够适应该请求 |
| **Best for** | Polished, known surfaces (flight cards, invoices) 经过精心处理的、易于识别的表面（如飞行卡片、发票） | Long-tail, exploratory, or internal surfaces 长尾的、探索性的或内部表面 |

In practice, many applications use both: fixed schemas for high-traffic, brand-sensitive surfaces, and dynamic schemas for everything else.
在实践中，许多应用程序同时使用两种方案：对于高流量且需要注重品牌形象的页面，使用固定的模式；而对于其他所有页面，则使用动态的模式。

Declarative Generative UI lets the agent compose interfaces from a catalog of building blocks — more flexible than controlled UI, more consistent than open-ended.
声明式生成式用户界面允许智能体从一系列构建模块中组合出各种界面——这种方式比受控式界面更加灵活，也比自由式界面更加稳定。
The A2UI spec defines three pieces: a component catalog (definitions + renderers), a schema (how components are arranged), and data bindings (runtime values).
A2UI 规范包含了三个核心要素：组件目录（包含组件的定义和渲染方式）、架构设计（组件之间的布局方式），以及数据绑定（运行时的值的传递方式）。
Dynamic schemas let the agent generate the layout on the fly — good for long-tail and exploratory surfaces.
动态模式允许代理实时生成布局——这对于需要长尾布局和探索性界面的情况非常有用。
Fixed schemas give you a predefined layout the agent populates with data — good for polished, high-traffic surfaces.
固定式的架构提供了预定义的布局，代理程序可以将数据填充到这些布局中——这种方式适用于需要呈现精美外观且流量较大的场景。
Both approaches can coexist in the same agent.
这两种方法可以在同一个代理中同时存在。



