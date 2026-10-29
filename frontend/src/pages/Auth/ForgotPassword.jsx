import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Brain,
  ShieldCheck
} from "lucide-react";

import { forgotPassword } from "../../services/authServices";
import BrandLogo from "../../components/BrandLogo";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword({
        email: email.trim()
      });

      /*
       * Development backend currently returns:
       * Password reset token generated : <token>
       */

      const token = response?.resetToken;

      setResetToken(token);
      setSuccess(true);

    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to process your request. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate(
      `/reset-password?token=${encodeURIComponent(resetToken)}`
    );
  };

  return (
    <div className="auth-page">

      {/* ================= LEFT BRAND PANEL ================= */}

      <section className="auth-brand-panel">

        <BrandLogo
          to="/"
          dark
        />

        <div className="brand-content">

          <div className="brand-badge">
            <Sparkles size={15} />
            AI-Powered Student Analytics
          </div>

          <h1>
            Secure access to your
            <span> academic insights.</span>
          </h1>

          <p>
            Reset your account password securely and
            continue managing student performance,
            analytics, and AI-powered insights.
          </p>

          <div className="brand-features">

            <div className="brand-feature">

              <div className="brand-feature-icon">
                <BarChart3 size={20} />
              </div>

              <div>

                <strong>
                  Performance Analytics
                </strong>

                <span>
                  Monitor student progress with meaningful analytics.
                </span>

              </div>

            </div>


            <div className="brand-feature">

              <div className="brand-feature-icon">
                <Brain size={20} />
              </div>

              <div>

                <strong>
                  AI-Powered Insights
                </strong>

                <span>
                  Generate intelligent recommendations from
                  performance data.
                </span>

              </div>

            </div>


            <div className="brand-feature">

              <div className="brand-feature-icon">
                <ShieldCheck size={20} />
              </div>

              <div>

                <strong>
                  Secure Account
                </strong>

                <span>
                  Protect your account with secure password management.
                </span>

              </div>

            </div>

          </div>

        </div>


        <div className="brand-footer">
          © 2026 Smart Performance Analyzer
        </div>

      </section>


      {/* ================= FORM PANEL ================= */}

      <section className="auth-form-panel">

        <div className="auth-form-container">


          {/* MOBILE LOGO */}

          <div className="mobile-auth-logo">

            <BrandLogo
              to="/"
            />

          </div>


          {/* BACK TO LOGIN */}

          <Link
            to="/login"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>


          {!success ? (

            <>
              {/* ================= HEADING ================= */}

              <div className="auth-heading">

                <span className="welcome-text">
                  ACCOUNT RECOVERY
                </span>

                <h2>
                  Forgot your password?
                </h2>

                <p>
                  Enter your registered email address and
                  we'll help you reset your password.
                </p>

              </div>


              {/* ================= FORM ================= */}

              <form
                onSubmit={handleSubmit}
                className="auth-form"
              >

                <div className="form-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div
                    className={`input-wrapper ${
                      error ? "input-error" : ""
                    }`}
                  >

                    <Mail size={18} />

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                    />

                  </div>


                  {error && (

                    <span className="error-message">
                      {error}
                    </span>

                  )}

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >

                  {loading ? (

                    <span>
                      Checking...
                    </span>

                  ) : (

                    <>
                      <span>
                        Continue
                      </span>

                      <ArrowRight size={18} />
                    </>

                  )}

                </button>

              </form>


              {/* BOTTOM TEXT */}

              <div className="auth-bottom-text">

                Remember your password?{" "}

                <Link to="/login">
                  Sign in
                </Link>

              </div>

            </>

          ) : (

            /* ================= SUCCESS STATE ================= */

            <div className="reset-success">

              <div className="success-icon">
                <CheckCircle2 size={42} />
              </div>


              <div className="auth-heading">

                <span className="welcome-text">
                  EMAIL VERIFIED
                </span>

                <h2>
                  Reset your password
                </h2>

                <p>
                  Your account was found successfully.
                  You can now create a new password.
                </p>

              </div>


              {/* DEVELOPMENT TOKEN */}

             {/* <div className="dev-token-box">

                <div className="dev-token-title">

                  <KeyRound size={16} />

                  Development Reset Token

                </div>


                <code>
                  {resetToken}
                </code>


                <small>
                  This token is displayed for development.
                  In production, it should be sent by email.
                </small>

              </div>*/}


              {/* RESET BUTTON */}

              <button
                type="button"
                className="auth-submit-btn"
                onClick={handleResetPassword}
              >

                <span>
                  Reset Password
                </span>

                <ArrowRight size={18} />

              </button>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default ForgotPassword;