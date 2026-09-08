function login(event) {
    event.preventDefault();

    let email = document.getElementById('email').value;
    let senha = document.getElementById('senha').value;

    // REGEX
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let regexSenha = /^\d{6}$/;

    if (
        regexEmail.test(email) &&
        regexSenha.test(senha) &&
        (
            (email === "Adm@gmail.com" && senha === "654321") ||
            (email === "josepher@gmail.com" && senha === "123456")
        )
    ) {
        alert("Login realizado com sucesso!");
        window.location.href = "producao/solusgrafepa.html";
    } else {
        alert("Email ou senha incorretos.");
    }
}