export default function About() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12">About</h1>

        <div className="prose prose-lg max-w-none">
          <p>
            The Exploratory Policy project aims to develop causal AI tools that formulate (synthesize and simulate) and
            analyze the impacts of policies within complex socio-economic systems. By integrating agent-based modeling,
            causal inference, and large language models, the project seeks to provide policymakers with interactive
            platforms to explore potential outcomes, identify unintended consequences, and enhance decision-making
            processes.
          </p>

          <h2>Our Mission</h2>
          <p>
            We believe that policy, like science and engineering, must be exploratory in nature—capable of simulating,
            testing, and adapting to uncertain technological frontiers. By applying structured exploratory
            methodologies, we seek to bridge the gap between speculative foresight and actionable governance, ensuring
            that societies can proactively engage with the accelerating pace of scientific and technological change.
          </p>

          <h2>The Challenge</h2>
          <p>
            Imagine trying to navigate a maze blindfolded. That's kind of what it's like when policymakers try to
            anticipate how their policies will play out. Traditional methods often fall short, leading to:
          </p>

          <ul>
            <li>
              <strong>Reactive Governance:</strong> Dealing with problems <em>after</em> they happen instead of
              preventing them.
            </li>
            <li>
              <strong>Misaligned Incentives:</strong> Policies unintentionally causing the opposite of what they
              intended.
            </li>
            <li>
              <strong>Systemic Fragility:</strong> The overall system is becoming more unstable.
            </li>
          </ul>

          <p>
            In short, we need better tools to understand the complex web of cause and effect in our socio-economic
            systems.
          </p>
        </div>
      </div>
    </div>
  )
}
