<script lang="ts">
  import { set } from "zod";
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
    } else if (password.length < 10) {
      registerError.password = 'Das Passwort muss mind. 10 Zeichen lang sein.';
      isValid = false;
    }

    return isValid;
  }

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
          console.log('Registrierung erfolgreich:', data);
          registrationSuccessMessage = 'Registrierung erfolgreich!'; // Erfolgsmeldung setzen
          // Optional: Nach kurzer Zeit die Nachricht wieder ausblenden
          setTimeout(() => {
            closeAuthModal();
          }, 1500);
        } else {
          console.error('Registrierung fehlgeschlagen:', data);
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

  async function submitLoginForm() {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login erfolgreich:', data);
        // Weiterleitung zum Dashboard
        window.location.href = '/lqms/dashboard';
      } else {
        console.error('Login fehlgeschlagen:', data.message);
        // Zeige ggf. Fehlermeldung im UI
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
    }
  }

  // async function fetchDateFact() {
  //     var today = new Date();
  //     var day = String(today.getDate()).padStart(2, '0');
  //     var month = String(today.getMonth() + 1).padStart(2, '0'); 
  //     try {
  //         const response = await fetch("https://numbersapi.p.rapidapi.com/"+month+"/"+day+"/date?json=true",
  //             {
  //                 method: 'GET',
  //                 headers: {
  //                     'x-rapidapi-key': 'b829319507msh5e68efc7f9de9e3p18add8jsn6c2dcebab1be',
	//                 'x-rapidapi-host': 'numbersapi.p.rapidapi.com'
  //                 }
  //             }
  //         );
  //         const data = await response.json(); 
  //         console.log(data);
  //         if (data.found) {
  //             document.getElementById("dateFact").innerHTML = data.text;
  //         } else {
  //             console.error("fact API Error at API side");
  //         }
          
  //     } catch (error) {
  //         console.error("Error getting fact data: ", error);
  //     }
  //   }
    
  //   fetchDateFact();

  //   async function getMeme() {
  //       try {
  //           const response = await fetch("https://api.imgflip.com/caption_image", {
  //               method: "POST",
  //               headers: {
  //               "Content-Type": "application/x-www-form-urlencoded"
  //               },
  //               body: new URLSearchParams({
  //                   template_id: "114585149",
  //                   text0: "Ich wenn die Meme API langsam lädt",
  //                   text1: "",
  //                   username: "webappproject",
  //                   password: "webappproject",
  //           })
  //           });
  //           const data = await response.json();
  //           if (data.success) {
  //               document.getElementById("meme").src = data.data.url;
  //           } else {
  //               console.error("Meme API Error: ", data.error_message);
  //           }
  //       } catch (error) {
  //           console.error("Error getting the meme:", error);
  //       };
  //   };
  //   getMeme();
</script>

<div class="hero">
  <h1>Optimiere dein Studium mit dem Lernqualitätsmanagementsystem</h1>
  <p>Verbessere deinen Lernprozess, behalte den Überblick und arbeite effizient mit deinen Kommilitonen.</p>
  <img id = "meme" style="width: 200px" src=""/>
  <button class="cta">Mehr erfahren</button>
  <a href="/lqms/dashboard">Hier geht es zum Dasboard (temporary route)</a>
  <a href="/lqms"> Another link </a>
  <a href="/lqms/lukas"> Hier gehts zum Button</a>
  <span><b>Daily Facts</b></span>
  <span id="dateFact">...</span>
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
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    font-family: Verdana;
    text-align: center;
    position: relative; /* Wichtig für die absolute Positionierung des Overlays */
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.1em;
    margin-bottom: 20px;
  }

  .cta {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-bottom: 20px;
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
</style>
