import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { login } from "../api/auth.api";
import { setAccessToken, setStoredUser } from "../utils/auth";

const loginSchema = z.object({
  email: z.email("Veuillez saisir un email valide."),
  password: z.string().min(1, "Veuillez saisir votre mot de passe."),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ApiErrorResponse = { error?: string };


export function LoginPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  //Configuration du formulaire
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

  //Appeller quand le formualilre est soumsi et les données sont valides
  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(""); //nouvelle connexion pour supprimer les erreurs précédantes

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
      //si erreur axios : recupération du code erreur ernvoyé par le back
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
      //si pas erreur axios
      setApiError("Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f7f7",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>Connexion pour admin</h1>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          Connectez-vous pour accéder au back-office Elyzen.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            {errors.email && (
              <p style={{ color: "crimson", marginTop: "6px" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            {errors.password && (
              <p style={{ color: "crimson", marginTop: "6px" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {apiError && <p style={{ color: "crimson", margin: 0 }}>{apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#222",
              color: "#fff",
              cursor: "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}