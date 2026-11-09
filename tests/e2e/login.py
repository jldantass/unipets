from getpass import getpass
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def testar_login():
    email = input("E-mail do usuario de teste: ").strip()
    senha = getpass("Senha do usuario de teste: ")
    evidencia = Path("test-evidence") / "E2E-01-login.png"

    with webdriver.Edge() as navegador:
        navegador.set_window_size(1280, 900)
        navegador.get("http://localhost:5173")
        espera = WebDriverWait(navegador, 20)

        formulario = espera.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "form.login-card"))
        )
        formulario.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys(email)
        formulario.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys(senha)
        formulario.find_element(By.TAG_NAME, "button").click()

        espera.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//h2[contains(., 'Banhos em andamento')]")
            )
        )
        evidencia.parent.mkdir(exist_ok=True)
        if not navegador.save_screenshot(str(evidencia)):
            raise RuntimeError("Nao foi possivel gravar a captura do painel.")

    print(f"E2E-01 aprovado. Evidencia em {evidencia}")


if __name__ == "__main__":
    testar_login()
