# Three-minute demo script

## 0:00-0:20 Problem

"AI agents fail in ways that are hard to see. A dashboard can show that a run
happened, but teams still need to know which tool call failed, whether the
answer was actionable, and what should change before the next run."

## 0:20-0:55 Run the agent

"TraceCoach starts from a real operator mission. I click Run observed loop. The
agent plans, executes a controlled workflow, evaluates the result, and writes a
self-improvement memo."

Show the plan and controlled answer.

## 0:55-1:35 Show Phoenix traces

"Every step is emitted as an OpenTelemetry span to Phoenix: planning, tool
execution, trace evaluation, and MCP self-introspection. This makes the agent
reviewable instead of magical."

Show Phoenix with span names:

- `agent.plan`
- `agent.execute_tools`
- `phoenix.evaluate_trace`
- `phoenix.mcp_self_introspection`

## 1:35-2:20 Show evaluation and improvement

"The agent does not just log traces. It evaluates trace groundedness,
actionability, goal fit, and tool efficiency. Then it uses the observed weak
span to write the next prompt experiment."

Show the eval score and self-improvement memo.

## 2:20-2:50 Why Arize MCP matters

"With Phoenix MCP, an AI coding assistant or agent can query projects, traces,
spans, prompts, datasets, and experiments directly. That means the improvement
loop can move from a one-off dashboard inspection into a repeatable development
workflow."

## 2:50-3:00 Closing

"TraceCoach turns agent observability into agent improvement: observe, evaluate,
improve, and replay. That is the reliability loop production teams need before
they can trust autonomous agents."
