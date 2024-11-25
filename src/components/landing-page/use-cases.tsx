export function UseCases() {
  const cases = [
    {
      title: "AI Code Generation",
      description: "Build features faster with integrated AI assistance and code generation capabilities.",
      examples: ["Function generation", "Component creation", "API integration"]
    },
    {
      title: "SaaS Applications",
      description: "Launch your SaaS product with built-in authentication, payments, and user management.",
      examples: ["Subscription handling", "User dashboard", "Payment processing"]
    },
    {
      title: "AI-Powered Tools",
      description: "Create AI-powered developer tools with OpenAI integration and token management.",
      examples: ["Code analysis", "Documentation generation", "PR reviews"]
    }
  ]

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-2">
                {item.examples.map((example, i) => (
                  <li key={i} className="text-sm text-gray-500">• {example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 