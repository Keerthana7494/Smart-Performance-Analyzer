
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStudent } from '../services/api'
import Toast from '../components/Toast'

export default function AddStudent() {
  const navigate = useNavigate()

  // Redirect to the correct page based on the logged-in role.
  const getDestination = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem('spa_user') || 'null'
      )

      return user?.role === 'ADMIN'
        ? '/admin/dashboard'
        : '/students'
    } catch {
      return '/login'
    }
  }

  const [form, setForm] = useState({
    studentName: '',
    email: '',
    course: ''
  })

  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  // Update form fields.
  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Validate the form.
  const validate = () => {
    const validationErrors = {}

    if (!form.studentName.trim()) {
      validationErrors.studentName = 'Student name is required'
    }

    if (!form.email.trim()) {
      validationErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = 'Enter a valid email'
    }

    if (!form.course.trim()) {
      validationErrors.course = 'Course is required'
    }

    setErrors(validationErrors)

    return Object.keys(validationErrors).length === 0
  }

  // Submit the student details.
  const submit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setSaving(true)

    try {
      await createStudent(form)

      setToast({
        message: 'Student created successfully',
        type: 'success'
      })

      // Admin returns to Admin Dashboard.
      // Trainer returns to Students list.
      setTimeout(() => {
        navigate(getDestination())
      }, 800)

    } catch (err) {
      setToast({
        message:
          err.response?.data?.message ||
          'Unable to create student',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-layout">
      <div className="card form-card">

        <div className="section-heading">
          <div>
            <h3>Student Details</h3>
            <p>
              Create the student profile before recording performance.
            </p>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">

            <Field
              label="Student Name"
              name="studentName"
              value={form.studentName}
              onChange={change}
              error={errors.studentName}
              placeholder="e.g. Arun Kumar"
            />

            <Field
              label="Email"
              name="email"
              value={form.email}
              onChange={change}
              error={errors.email}
              placeholder="e.g. arun@example.com"
              type="email"
            />

            <Field
              label="Course"
              name="course"
              value={form.course}
              onChange={change}
              error={errors.course}
              placeholder="e.g. Java Full Stack"
            />

          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate(getDestination())}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-card">
        <span className="eyebrow">NEXT STEP</span>
        <h3>Record performance</h3>
        <p>
          After creating the student, use the performance form
          to enter attendance, assignment, test and project scores.
        </p>
      </div>

      <Toast
        {...toast}
        onClose={() => setToast(null)}
      />
    </div>
  )
}

// Reusable form field.
function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = 'text'
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
      />

      {error && (
        <small className="error">
          {error}
        </small>
      )}
    </label>
  )
}
