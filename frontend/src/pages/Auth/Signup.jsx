import { signupUser } from "../../services/authServices";
import { saveSession } from "../../services/session";
import { useState } from "react";
import BrandLogo from "../../components/BrandLogo";
import {
  User,
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

import { Link, useNavigate } from "react-router-dom";

function Signup() {
  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // =========================================================
  // UI STATE
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  // =========================================================
  // PASSWORD STRENGTH
  // =========================================================

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        score: 0,
        label: "",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        score: 1,
        label: "Weak",
      };
    }

    if (score <= 4) {
      return {
        score: 2,
        label: "Medium",
      };
    }

    return {
      score: 3,
      label: "Strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Enter a valid full name";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    // Terms
    if (!formData.terms) {
      newErrors.terms =
        "Please accept the terms and conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // HANDLE SIGNUP
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      setErrors({});

      // =====================================================
      // SIGNUP API
      // =====================================================

      const response = await signupUser({
        fullName: formData.fullName.trim(),

        email: formData.email
          .trim()
          .toLowerCase(),

        password: formData.password,

        confirmPassword: formData.confirmPassword,
      });

      console.log("Signup successful:", response);

      // =====================================================
      // IMPORTANT
      // =====================================================
      // Do NOT save session here if your signup API is only
      // creating the account and the user should login after
      // signup.
      //
      // Signup → Alert → Landing Page
      // Login  → Alert → Dashboard
      //
      // Therefore saveSession(response) is intentionally NOT
      // called here.
      // =====================================================

      window.alert(
        "Account created successfully!\n\nPlease login to continue."
      );

      // After user clicks OK
      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error("Signup failed:", error);

      const responseData = error.response?.data;

      console.log(
        "Backend response:",
        responseData
      );

      const backendErrors =
        responseData?.validationErrors || {};

      setErrors({
        ...backendErrors,

        submit:
          responseData?.message ||
          "Unable to create account. Please try again.",
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="auth-page">

      {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}

      <div className="auth-brand-panel">

        <div className="auth-brand-content">

          <BrandLogo
          to="/"
             dark
           />

          <div className="auth-brand-main">

            <div className="auth-badge">
              <Sparkles size={15} />
              AI-Powered Student Analytics
            </div>

            <h1>
              Start analyzing
              <br />

              <span>
                student performance
              </span>

              <br />

              smarter.
            </h1>

            <p>
              Create your account and unlock
              intelligent performance analytics,
              risk detection and AI-powered
              recommendations.
            </p>

            <div className="auth-features">

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  <BarChart3 size={19} />
                </div>

                <div>
                  <h4>
                    Performance Analytics
                  </h4>

                  <p>
                    Track student performance
                    with meaningful insights.
                  </p>
                </div>

              </div>

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  <Brain size={19} />
                </div>

                <div>
                  <h4>
                    AI-Powered Insights
                  </h4>

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
                  <h4>
                    Secure & Reliable
                  </h4>

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

      {/* =====================================================
          RIGHT FORM PANEL
      ====================================================== */}

      <div className="auth-form-panel">

        <div className="auth-form-container">

          {/* MOBILE LOGO */}

          <div className="mobile-auth-logo">

  <BrandLogo
    to="/"
  />

</div>

          {/* HEADING */}

          <div className="auth-heading">

            <h2>
              Create your account
            </h2>

            <p>
              Get started with your AI-powered
              performance analyzer.
            </p>

          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* GLOBAL ERROR */}

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            {/* FULL NAME */}

            <div className="form-group">

              <label htmlFor="fullName">
                Full Name
              </label>

              <div className="input-wrapper">

                <User size={18} />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="name"
                />

              </div>

              {errors.fullName && (
                <span className="form-error">
                  {errors.fullName}
                </span>
              )}

            </div>

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
                />

              </div>

              {errors.email && (
                <span className="form-error">
                  {errors.email}
                </span>
              )}

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {/* PASSWORD STRENGTH */}

              {formData.password && (
                <div className="password-strength">

                  <div className="strength-bars">

                    {[1, 2, 3].map(
                      (item) => (
                        <span
                          key={item}
                          className={
                            item <=
                            passwordStrength.score
                              ? "strength-bar active"
                              : "strength-bar"
                          }
                        />
                      )
                    )}

                  </div>

                  <span>
                    {passwordStrength.label}
                  </span>

                </div>
              )}

              {errors.password && (
                <span className="form-error">
                  {errors.password}
                </span>
              )}

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {errors.confirmPassword && (
                <span className="form-error">
                  {errors.confirmPassword}
                </span>
              )}

            </div>

            {/* TERMS */}

            <div className="terms-container">

              <label className="terms-label">

                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <span>
                  I agree to the{" "}

                  <a href="#terms">
                    Terms & Conditions
                  </a>

                  {" "}and{" "}

                  <a href="#privacy">
                    Privacy Policy
                  </a>
                </span>

              </label>

              {errors.terms && (
                <span className="form-error">
                  {errors.terms}
                </span>
              )}

            </div>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <span className="button-spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}

            </button>

            {/* DIVIDER */}

           {/* <div className="auth-divider">
              <span>
                or continue with
              </span>
            </div>*/}

            {/* GOOGLE 

            <button
              type="button"
              className="google-btn"
              onClick={() =>
                console.log(
                  "Google signup clicked"
                )
              }
              disabled={isSubmitting}
            >

              <span className="google-icon">
                G
              </span>

              Continue with Google

            </button>*/}

            {/* LOGIN */}

            <div className="auth-switch">

              Already have an account?

              <Link to="/login">
                Sign In
              </Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Signup;

