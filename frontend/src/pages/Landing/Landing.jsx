import { Link } from "react-router-dom";
import BrandLogo from '../../components/BrandLogo'
function Landing() {
 return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <BrandLogo/>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <Link to="/login" className="login-link">
            Sign In
          </Link>

          <Link to="/signup" className="signup-btn">
            Get Started
          </Link>
        </div>

      </nav>


      {/* ================= HERO SECTION ================= */}
      <main className="hero">

        {/* LEFT SIDE */}
        <div className="hero-content">

          <div className="badge">
            ✦ AI-Powered Student Analytics
          </div>

          <h1>
            Understand Student
            <br />
            <span>Performance Smarter.</span>
          </h1>

          <p>
            Analyze student performance, identify learning risks,
            and generate intelligent insights using AI-powered
            analytics.
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="primary-btn">
              Get Started →
            </Link>

            <Link to="/login" className="secondary-btn">
              Sign In
            </Link>

          </div>

          <div className="trust-text">
            Built for educators • Data-driven • AI-powered
          </div>

        </div>


        {/* RIGHT SIDE - AI VISUAL */}
        <div className="hero-card">

          <div className="card-header">

            <div>
              <small>Smart Performance Analyzer</small>

              <h3>
                AI Performance Insights
              </h3>
            </div>

            <div className="ai-icon">
              ✦
            </div>

          </div>


          {/* AI VISUAL */}
          <div className="ai-visual">

            <div className="ai-circle">
              <span>✦</span>
            </div>

            <div className="ai-text">
              <strong>
                Intelligent Analysis
              </strong>

              <p>
                Transform student data into meaningful
                performance insights.
              </p>
            </div>

          </div>


          {/* FEATURES */}
          <div className="insight-list">

            <div className="insight-item">
              <span className="check">✓</span>

              <div>
                <strong>Performance Tracking</strong>

                <p>
                  Monitor academic progress
                </p>
              </div>
            </div>


            <div className="insight-item">
              <span className="check">✓</span>

              <div>
                <strong>Risk Identification</strong>

                <p>
                  Detect students needing attention
                </p>
              </div>
            </div>


            <div className="insight-item">
              <span className="check">✓</span>

              <div>
                <strong>AI Recommendations</strong>

                <p>
                  Generate personalized insights
                </p>
              </div>
            </div>

          </div>


          {/* AI MESSAGE */}
          <div className="ai-insight">

            <span>✦</span>

            <div>
              <strong>AI-Powered Analysis</strong>

              <p>
                Make better academic decisions with
                intelligent data-driven insights.
              </p>
            </div>

          </div>

        </div>

      </main>


      {/* ================= FEATURES ================= */}
      <section id="features" className="features">

        <div className="section-heading">

          <span>
            POWERFUL FEATURES
          </span>

          <h2>
            Everything you need to understand performance
          </h2>

          <p>
            A smarter way to monitor, analyze and improve
            student performance.
          </p>

        </div>


        <div className="feature-grid">

          {/* Feature 1 */}
          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>
              Performance Analytics
            </h3>

            <p>
              Track attendance, assignments, tests,
              projects and overall student performance.
            </p>

          </div>


          {/* Feature 2 */}
          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Insights
            </h3>

            <p>
              Use AI-powered analysis to generate
              meaningful recommendations from student data.
            </p>

          </div>


          {/* Feature 3 */}
          <div className="feature-card">

            <div className="feature-icon">
              ⚠️
            </div>

            <h3>
              Risk Detection
            </h3>

            <p>
              Identify students who may need additional
              academic support and intervention.
            </p>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section id="about" className="about">

        <div className="about-content">

          <span className="section-label">
            ABOUT THE PLATFORM
          </span>

          <h2>
            Turning student data into meaningful insights.
          </h2>

          <p>
            Smart Performance Analyzer combines modern
            application development, data analytics and
            artificial intelligence to help educators
            understand student performance more effectively.
          </p>

          <p>
            From performance tracking to AI-powered
            recommendations, the platform provides a
            centralized solution for data-driven academic
            decision making.
          </p>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="cta">

        <h2>
          Ready to make student performance smarter?
        </h2>

        <p>
          Start exploring your intelligent performance
          analytics platform.
        </p>

        <Link to="/signup" className="primary-btn">
          Get Started →
        </Link>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

          <BrandLogo showLink={false} />

        <p>
          AI-powered student performance analytics.
        </p>

        <p className="copyright">
          © 2026 Smart Performance Analyzer. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Landing;

