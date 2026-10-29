import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";

import { resetPassword } from "../../services/authServices";
import BrandLogo from "../../components/BrandLogo";

function ResetPassword() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");


  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });


  const [errors, setErrors] = useState({});

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);


  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));


    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: ""
    }));

  };


  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {

    const newErrors = {};


    if (!token) {

      newErrors.submit =
        "Invalid or missing password reset token.";

    }


    if (!formData.password) {

      newErrors.password =
        "New password is required";

    } else if (
      formData.password.length < 8
    ) {

      newErrors.password =
        "Password must contain at least 8 characters";

    }


    if (!formData.confirmPassword) {

      newErrors.confirmPassword =
        "Please confirm your new password";

    } else if (
      formData.password !==
      formData.confirmPassword
    ) {

      newErrors.confirmPassword =
        "Passwords do not match";

    }


    setErrors(newErrors);


    return (
      Object.keys(newErrors).length === 0
    );

  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!validateForm()) {
      return;
    }


    try {

      setLoading(true);


      await resetPassword({

        token,

        newPassword:
          formData.password,

        confirmPassword:
          formData.confirmPassword

      });


      setSuccess(true);


    } catch (err) {

      console.error(
        "Reset password error:",
        err
      );


      setErrors({

        submit:
          err.response?.data?.message ||
          err.response?.data ||
          "Unable to reset password. Please try again."

      });


    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */

  if (success) {

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

              Smart Performance Analyzer

            </div>


            <h1>

              Your account is

              <span>
                {" "}secured again.
              </span>

            </h1>


            <p>

              Your password has been updated successfully.
              You can now sign in with your new password.

            </p>


            <div className="brand-features">

              <div className="brand-feature">

                <div className="brand-feature-icon">

                  <ShieldCheck
                    size={20}
                  />

                </div>


                <div>

                  <strong>
                    Password Updated
                  </strong>

                  <span>

                    Your new password has been
                    securely stored.

                  </span>

                </div>

              </div>

            </div>

          </div>


          <div className="brand-footer">

            © 2026 Smart Performance Analyzer

          </div>

        </section>


        {/* ================= SUCCESS FORM PANEL ================= */}

        <section className="auth-form-panel">

          <div className="auth-form-container">

            {/* MOBILE LOGO */}

            <div className="mobile-auth-logo">

              <BrandLogo
                to="/"
              />

            </div>


            <div className="success-page">

              <div className="success-icon">

                <CheckCircle2
                  size={46}
                />

              </div>


              <span className="welcome-text">
                SUCCESS
              </span>


              <h2>
                Password reset successful
              </h2>


              <p>

                Your password has been changed successfully.
                You can now sign in using your new password.

              </p>


              <button
                className="auth-submit-btn"
                onClick={() =>
                  navigate("/login")
                }
              >

                <span>
                  Go to Login
                </span>

                <ArrowRight
                  size={18}
                />

              </button>

            </div>

          </div>

        </section>

      </div>

    );

  }


  /* =====================================================
     RESET PASSWORD PAGE
  ===================================================== */

  return (

    <div className="auth-page">


      {/* =================================================
          LEFT BRAND PANEL
      ================================================= */}

      <section className="auth-brand-panel">

        <BrandLogo
          to="/"
          dark
        />


        <div className="brand-content">

          <div className="brand-badge">

            <Sparkles size={15} />

            Secure Account Recovery

          </div>


          <h1>

            Create a new

            <span>
              {" "}secure password.
            </span>

          </h1>


          <p>

            Choose a strong password to protect your
            Smart Performance Analyzer account.

          </p>


          <div className="brand-features">

            <div className="brand-feature">

              <div className="brand-feature-icon">

                <ShieldCheck
                  size={20}
                />

              </div>


              <div>

                <strong>
                  Secure Password
                </strong>

                <span>

                  Passwords are securely encrypted
                  before storage.

                </span>

              </div>

            </div>

          </div>

        </div>


        <div className="brand-footer">

          © 2026 Smart Performance Analyzer

        </div>

      </section>


      {/* =================================================
          FORM PANEL
      ================================================= */}

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


          {/* HEADING */}

          <div className="auth-heading">

            <span className="welcome-text">

              RESET PASSWORD

            </span>


            <h2>

              Create new password

            </h2>


            <p>

              Enter a new password for your account.

            </p>

          </div>


          {/* =================================================
              RESET PASSWORD FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >


            {/* =================================================
                NEW PASSWORD
            ================================================= */}

            <div className="form-group">

              <label htmlFor="password">

                New Password

              </label>


              <div
                className={`input-wrapper ${
                  errors.password
                    ? "input-error"
                    : ""
                }`}
              >

                <Lock size={18} />


                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
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

                <span className="error-message">

                  {errors.password}

                </span>

              )}

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className="form-group">

              <label htmlFor="confirmPassword">

                Confirm New Password

              </label>


              <div
                className={`input-wrapper ${
                  errors.confirmPassword
                    ? "input-error"
                    : ""
                }`}
              >

                <Lock size={18} />


                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
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
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >

                  {showConfirmPassword ? (

                    <EyeOff size={18} />

                  ) : (

                    <Eye size={18} />

                  )}

                </button>

              </div>


              {errors.confirmPassword && (

                <span className="error-message">

                  {errors.confirmPassword}

                </span>

              )}

            </div>


            {/* =================================================
                BACKEND ERROR
            ================================================= */}

            {errors.submit && (

              <div className="form-submit-error">

                {errors.submit}

              </div>

            )}


            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >

              {loading ? (

                <span>
                  Updating Password...
                </span>

              ) : (

                <>

                  <span>
                    Reset Password
                  </span>

                  <ArrowRight
                    size={18}
                  />

                </>

              )}

            </button>

          </form>

        </div>

      </section>

    </div>

  );
}

export default ResetPassword;