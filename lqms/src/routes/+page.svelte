<script lang="ts">
  import { goto } from '$app/navigation';
  let showAuthModal: 'register' | 'login' | null = null;
  let registrationSuccessMessage: string | null = null;
  let username = '';
  let email = '';
  let password = '';
  let registerError: {
    username?: string;
    email?: string;
    password?: string;
  } = {};

  function openAuthModal(type: 'register' | 'login') {
    showAuthModal = type;
    resetRegisterForm();
  }

  function closeAuthModal() {
    showAuthModal = null;
    resetRegisterForm();
    resetLoginForm();
    registrationSuccessMessage = null;
  }

  function resetRegisterForm() {
    username = '';
    email = '';
    password = '';
    registerError = {};
    registrationSuccessMessage = null;
  }

  function resetLoginForm() {
    username = '';
    email = '';
    password = '';
  }

  function validateEmail(email: string): boolean {
    /** E-Mail Pattern */
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  function validatePassword(pw: string): boolean {
    /** Passwort Pattern */
    const pwRegex = /^[^"'\\;`<>]{10,}$/;
    return pwRegex.test(pw);
  }

  function validateRegisterForm(): boolean {
    let isValid = true;
    registerError = {};

    if (!username.trim()) {
      registerError.username = 'Benutzername ist erforderlich.';
      isValid = false;
    } else if (username.length > 16) {
      registerError.username = 'Der Benutzername darf max. 16 Zeichen enthalten.';
      isValid = false;
    } else if (username.length < 2) {
      registerError.username = 'Der Benutzername muss mind. 2 Zeichen enthalten.';
      isValid = false;
    }

    if (!email.trim()) {
      registerError.email = 'E-Mail ist erforderlich.';
      isValid = false;
    } else if (!validateEmail(email)) {
      registerError.email = 'Ungültige E-Mail-Adresse.';
      isValid = false;
    }

    if (!password.trim()) {
      registerError.password = 'Passwort ist erforderlich.';
      isValid = false;
    } else if (!validatePassword(password)) {
      registerError.password = 'Das Passwort muss mind. 2 Zeichen enthalten. Und darf nicht: ", \', \\, ;, `, <, > enthalten.';
      isValid = false;
    }

    return isValid;
  }

  /** Senden des Registrierungsformulars */
  async function submitRegisterForm() {
    if (validateRegisterForm()) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          registrationSuccessMessage = 'Registrierung erfolgreich!';
          setTimeout(() => {
            closeAuthModal();
          }, 1250);
        } else {
          registerError.general = data.message || 'Registrierung fehlgeschlagen.';
          if (data.errors) {
            data.errors.forEach((error) => {
              if (error.path && error.message) {
                registerError[error.path[0]] = error.message;
              }
            });
          }
        }
      } catch (error) {
        console.error('Fehler beim Senden der Registrierungsanfrage:', error);
        registerError.general = 'Verbindungsfehler zum Server.';
      }
    }
  }

  /** Senden des Loginformulars */
  async function submitLoginForm() {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Weiterleitung zum Dashboard
        window.location.href = '/lqms/dashboard';
      } else {
        console.error('Login fehlgeschlagen:', data.message);
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
    }
  }
</script>

<div class="hero">
  <div class="app-container">
    <div class="top-left-box">
      <div class="auth-links">
        <button class="register-button" on:click={() => openAuthModal('register')}>
          Registrieren
        </button>
        oder
        <button class="login-button" on:click={() => openAuthModal('login')}>
          Anmelden
        </button>
      </div>
    </div>

    <button class="cta top-right-button" on:click={() => goto('/lqms/dashboard')}>Zum Start!</button>

    <div class="headline">
      <h1>LQMS</h1>
      <h2>Lernqualitätsmanagementsystem</h2>
    </div>

    <div class="content-box">
      <div class="info-columns"> <!--50 50 box-->
        <div class="info-box">
          <h3>Was ist das LQMS?</h3>
          <div class="section">
            <div class="text">
              <b>Optimiere dein Studium mit dem Lernqualitätsmanagementsystem</b>
              <p>Verbessere deinen Lernprozess, behalte den Überblick und arbeite effizient mit deinen Kommilitonen.</p>
              <button class="cta" on:click={() => goto('/lqms/lukas')}>Hier gehts zum Button</button>
              <button class="cta" on:click={() => goto('/lqms')}>Hier gehts zur Zwischenseite</button>
            </div>
          </div>
        </div>
        <div class="info-box">
          <h3>Womit hilft es dir?</h3>
          <div class="section">
            <div class="text">
              <p>Lorem ipsum dolor sit amet, consectetur sadipscing elitr, sed diam nonumy eirmod tempor...</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Über uns</h3>
      <div class="avatar-grid">
        <div class="avatar-card">
          <h4>Marco </h4>
          <img src="https://avatars.githubusercontent.com/u/42667267?s=400&u=13540984947564df7cadf4831d28dbd3e62ce53c&v=4" alt="Avatar von El Don" />
          <p>Backend-Profi</p>
        </div>
        <div class="avatar-card">
          <h4>Lukas</h4>
          <img src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png" alt="Avatar 2" />
          <p>Zeitmanipulator</p>
        </div>
        <div class="avatar-card">
          <h4>Nastii</h4>
          <img src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png" alt="Avatar 3" />
          <p>Farbspezialist</p>
        </div>
        <div class="avatar-card">
          <h4>Nik</h4>
          <img src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png" alt="Avatar 4" />
          <p>Spaghetticodemonster</p>
        </div>
      </div>
    </div>
  </div>
</div>


{#if showAuthModal}
  <div class="modal-overlay" on:click={closeAuthModal}>
    <div class="auth-modal" on:click|stopPropagation>
      <button class="close-button" on:click={closeAuthModal}>&times;</button>
      {#if showAuthModal === 'register'}
        <h2>Registrieren</h2>
        <form on:submit|preventDefault={submitRegisterForm}>
          {#if registerError.general}
            <p class="error-message general-error">{registerError.general}</p>
          {/if}
          {#if registrationSuccessMessage}
            <p class="success-message">{registrationSuccessMessage}</p>
          {:else}
            <input type="text" placeholder="Benutzername" bind:value={username}>
            {#if registerError.username}
              <p class="error-message">{registerError.username}</p>
            {/if}
            <input type="email" placeholder="E-Mail" bind:value={email}>
            {#if registerError.email}
              <p class="error-message">{registerError.email}</p>
            {/if}
            <input type="password" placeholder="Passwort" bind:value={password}>
            {#if registerError.password}
              <p class="error-message">{registerError.password}</p>
            {/if}
            <button type="submit">Registrieren</button>
          {/if}
        </form>
      {:else if showAuthModal === 'login'}
        <h2>Anmelden</h2>
        <form on:submit|preventDefault={submitLoginForm}>
          <input type="text" placeholder="Benutzername oder E-Mail" bind:value={username}>
          <input type="password" placeholder="Passwort" bind:value={password}>
          <button type="submit">Anmelden</button>
          <a href="/forgot-password">Passwort vergessen?</a>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .info-columns {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
  }

  .info-box {
    flex: 1 1 50%;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    font-family: Verdana;
    text-align: center;
    position: relative; /* Wichtig für die absolute Positionierung des Overlays */
  }

  .cta {
    padding: 10px 20px;
    background-color: #d65ba9;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-bottom: 20px;
  }

  .cta.top-right-button{
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .auth-links {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .auth-links button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-weight: bold;
    color: #333;
  }

  /* Styles für das Modal-Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Stellt sicher, dass es über anderen Inhalten liegt */
  }

  /* Styles für das Auth-Modal */
  .auth-modal {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    font-family: Verdana;
    width: 400px;
    max-width: 90%;
    position: relative; /* Für die Positionierung des Schließen-Buttons */
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    color: #555;
  }

  .auth-modal h2 {
    margin-top: 0;
    margin-bottom: 15px;
    text-align: center;
  }

  .auth-modal form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .auth-modal input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
  }

  .auth-modal button[type="submit"] {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
  }

  .auth-modal a {
    text-align: center;
    color: #007bff;
    text-decoration: none;
    font-size: 0.9em;
  }

  .general-error {
    color: darkred;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .success-message {
    color: darkgreen;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .top-left-box {
    background: white;
    color: #444;
    padding: 1rem;
    border-radius: 1rem;
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .headline {
    text-align: center;
    margin-top: 6rem;
  }

  .headline h1 {
    font-size: 4rem;
    margin: 0;
  }

  .headline h2 {
    font-size: 1.2rem;
    font-weight: 300;
    margin-top: 0.5rem;
  }

  .content-box {
    background: #CA74A0;
    border-radius: 1rem;
    padding: 2rem;
    margin-top: 2rem;
  }


  .section {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .text {
    flex: 1;
    min-width: 250px;
  }

  .image {
    flex: 1;
    min-width: 250px;
  }

  .image img {
    width: 100%;
    border-radius: 0.5rem;
  }

  .avatar-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.avatar-card {
  background: white;
  color: #333;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  width: 150px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-card img {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  margin: 0.5rem 0;
}

.avatar-card h4 {
  margin: 0;
  font-size: 1rem;
}

.avatar-card p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

</style>