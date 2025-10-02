import React from 'react';
import { Zap, Users, Heart } from 'lucide-react';

const HowToContribute = () => {
  const contributionGuide = {
    steps: [
      {
        title: "1. Choose the Right Repository",
        content: "Look for repositories with 'good first issue' labels, active maintainers, and clear contribution guidelines.",
        tips: ["Check the CONTRIBUTING.md file", "Look for recent activity", "Start with documentation fixes"]
      },
      {
        title: "2. Set Up Your Development Environment",
        content: "Fork the repository, clone it locally, and follow the setup instructions in the README.",
        tips: ["Read the README thoroughly", "Install all dependencies", "Run tests to ensure everything works"]
      },
      {
        title: "3. Find an Issue to Work On",
        content: "Browse issues labeled 'good first issue', 'help wanted', or 'beginner friendly'.",
        tips: ["Comment on the issue to claim it", "Ask questions if unclear", "Start small"]
      },
      {
        title: "4. Make Your Changes",
        content: "Create a new branch, make your changes, and test thoroughly before submitting.",
        tips: ["Follow the code style", "Write clear commit messages", "Add tests if needed"]
      },
      {
        title: "5. Submit a Pull Request",
        content: "Push your changes and create a pull request with a clear description.",
        tips: ["Reference the issue number", "Explain your solution", "Be responsive to feedback"]
      }
    ]
  };

  return (
    <div>
      {/* Contribution Guide */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
          How to Make Your First Open Source Contribution
        </h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>
          Follow these steps to start contributing to open source projects and make a meaningful impact in the developer community.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {contributionGuide.steps.map((step, index) => (
            <div key={index} className="step-guide" style={{ display: 'flex', gap: '24px' }}>
              <div className="step-number">
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.7' }}>
                  {step.content}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {step.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', textAlign: 'center' }}>
          Why Open Source Matters
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="success-card">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              <Users style={{ width: '24px', height: '24px', color: '#1d4ed8' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Build Your Network
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              Connect with developers worldwide, learn from experienced maintainers, and build lasting professional relationships.
            </p>
          </div>

          <div className="success-card">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
              <Zap style={{ width: '24px', height: '24px', color: '#15803d' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Improve Your Skills
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              Work on real-world projects, learn new technologies, and get code reviews from experienced developers.
            </p>
          </div>

          <div className="success-card">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <Heart style={{ width: '24px', height: '24px', color: '#d97706' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Give Back
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              Help improve tools that millions of developers use daily and make a positive impact on the tech community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToContribute;