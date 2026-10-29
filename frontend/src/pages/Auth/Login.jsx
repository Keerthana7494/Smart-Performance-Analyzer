
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Brain,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import BrandLogo from "../../components/BrandLogo";
import { loginUser } from "../../services/authServices";
import { saveSession } from "../../services/session";

function Login() {
  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // =========================================================
  // UI STATE
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the relevant error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // HANDLE LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent API call if form validation fails
    if (!validateForm()) {
      return;
    }

    try {
      // Start loading and clear previous errors
      setIsSubmitting(true);
      setErrors({});

      // Call the Spring Boot login API
      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Login successful");
      console.log(response);

      // Save authentication tokens and user information
      saveSession(response);

      // Handle first-login temporary password
      if (response.mustChangePassword) {
        navigate("/change-temporary-password", {
          replace: true,
        });
        return;
      }

      // Navigate according to the authenticated user's role
      switch (response.role) {
        case "STUDENT":
          navigate("/student-home", {
            replace: true,
          });
          break;

        case "ADMIN":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;
        case "TRAINER":
          navigate("/dashboard", {
            replace: true,
          });
          break;

        default:
          console.error(
            "Unknown user role:",
            response.role
          );

          setErrors({
            submit:
              "Your account role is invalid. Please contact support.",
          });
      }
    } catch (error) {
      // Handle errors returned by Axios or the server
      console.error(
        "Login failed:",
        error.response?.status,
        error.response?.data
      );

      const responseData = error.response?.data;

      // Read backend field-validation errors, if present
      const backendErrors =
        responseData?.validationErrors &&
        typeof responseData.validationErrors === "object"
          ? responseData.validationErrors
          : {};

      let message;

      if (error.response?.status === 401) {
        // Covers unregistered email or incorrect password
        message =
          responseData?.message ||
          "Invalid email or password. Please try again.";
      } else if (error.response?.status === 400) {
        message =
          responseData?.message ||
          "Please check the information you entered.";
      } else if (error.response?.status >= 500) {
        message =
          "A server error occurred. Please try again later.";
      } else if (!error.response) {
        message =
          "Cannot connect to the server. Please check your connection.";
      } else {
        message =
          responseData?.message ||
          "Unable to log in. Please try again.";
      }

      // Display the error in the login form
      setErrors({
        ...backendErrors,
        submit: message,
      });
    } finally {
      // Always stop the loading indicator
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="auth-page">
      {/* LEFT BRAND PANEL */}

      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <BrandLogo to="/" dark />

          <div className="auth-brand-main">
            <div className="auth-badge">
              <Sparkles size={15} />
              AI-Powered Student Analytics
            </div>

            <h1>
              Smarter insights.
              <br />
              <span>Better performance.</span>
              <br />
              Better outcomes.
            </h1>

            <p>
              Sign in to monitor student performance,
              identify learning risks and generate
              AI-powered recommendations.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <BarChart3 size={19} />
                </div>

                <div>
                  <h4>Performance Analytics</h4>
                  <p>
                    Track student performance with
                    meaningful insights.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <Brain size={19} />
                </div>

                <div>
                  <h4>AI-Powered Insights</h4>
                  <p>
                    Identify patterns and generate
                    intelligent recommendations.
                  </p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h4>Secure &amp; Reliable</h4>
                  <p>
                    Your student analytics stay
                    protected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 Smart Performance Analyzer
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}

      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* MOBILE LOGO */}

          <div className="mobile-auth-logo">
            <BrandLogo to="/" />
          </div>

          {/* HEADING */}

          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>
              Sign in to continue to your
              performance dashboard.
            </p>
          </div>

          {/* LOGIN FORM */}

          <form onSubmit={handleSubmit} noValidate>
            {/* GLOBAL ERROR */}

            {errors.submit && (
              <div
                className="error-message"
                role="alert"
                aria-live="polite"
              >
                {errors.submit}
              </div>
            )}

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                />
              </div>

              {errors.email && (
                <span
                  id="email-error"
                  className="form-error"
                >
                  {errors.email}
                </span>
              )}
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="forgot-password-link"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <span
                  id="password-error"
                  className="form-error"
                >
                  {errors.password}
                </span>
              )}
            </div>

            {/* REMEMBER ME */}

            <div className="remember-container">
              <label className="remember-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  disabled={isSubmitting}
                />

                <span>Remember me</span>
              </label>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* DIVIDER */}

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* SIGNUP */}

            <div className="auth-switch">
              Don't have an account?{" "}
              <Link to="/signup">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
