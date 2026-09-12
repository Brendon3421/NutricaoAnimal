"use client"
import React, { useState } from "react"
import styles from "./auth.module.css"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Preencha email e senha")
      return
    }
    setLoading(true)
    try {
      await new Promise((res) => setTimeout(res, 800))
      alert("Autenticado (simulação): " + email)
    } catch (err) {
      setError("Erro ao autenticar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Email or Phone
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@exemplo.com"
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <div className={styles.rememberRow}>
          <label style={{display:'flex',alignItems:'center',gap:8}}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className={styles.smallText}>Remember me</span>
          </label>
          <a className={styles.forgotLink} href="#">Forgot Password?</a>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Login"}
        </button>
      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.socialContainer}>
        <button className={styles.socialBtn} onClick={() => alert('Continuar com Google (simulação)')}>
          <span style={{width:20}}>G</span>
          <span>Continue with Google</span>
        </button>

        <button className={styles.socialBtn} onClick={() => alert('Continuar com Email OTP (simulação)')}>
          <span style={{width:20}}>🔑</span>
          <span>Continue with Email OTP</span>
        </button>
      </div>
    </div>
  )
}
