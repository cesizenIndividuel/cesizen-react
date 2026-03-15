import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { login } from "../api/auth.api";
import { setAccessToken, setStoredUser } from "../utils/auth";
import "./LoginPage.css";

const loginSchema = z.object({
  email: z.email("Veuillez saisir un email valide."),
  password: z.string().min(1, "Veuillez saisir votre mot de passe."),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ApiErrorResponse = { error?: string };

export function LoginPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError("");

      const result = await login(data);

      if (result.user.role !== "ADMIN") {
        setApiError(
          "Accès refusé : cette interface est réservée aux administrateurs."
        );
        return;
      }

      setAccessToken(result.accessToken);
      setStoredUser(result.user);
      navigate("/admin");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const apiMessage = error.response?.data?.error;

        if (apiMessage === "INVALID_CREDENTIALS") {
          setApiError("Email ou mot de passe incorrect.");
          return;
        }

        if (apiMessage === "ACCOUNT_INACTIVE") {
          setApiError("Votre compte est désactivé.");
          return;
        }
      }

      setApiError("Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">Connexion admin</h1>
        <p className="login-page__subtitle">
          Connecte-toi pour accéder au back-office CESIZen.
        </p>

        <form className="login-page__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="login-page__field">
            <label className="login-page__label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className={`login-page__input ${
                errors.email ? "login-page__input--error" : ""
              }`}
              placeholder="admin@cesizen.fr"
              {...register("email")}
            />
            {errors.email && (
              <p className="login-page__error">{errors.email.message}</p>
            )}
          </div>

          <div className="login-page__field">
            <label className="login-page__label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className={`login-page__input ${
                errors.password ? "login-page__input--error" : ""
              }`}
              placeholder="Votre mot de passe"
              {...register("password")}
            />
            {errors.password && (
              <p className="login-page__error">{errors.password.message}</p>
            )}
          </div>

          {apiError && <p className="login-page__api-error">{apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="login-page__submit"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}