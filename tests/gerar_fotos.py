from pathlib import Path
from struct import pack
from zlib import compress, crc32


def bloco(tipo, dados):
    return pack(">I", len(dados)) + tipo + dados + pack(">I", crc32(tipo + dados))


def gerar_fotos():
    pasta = Path("test-evidence") / "fotos-teste"
    pasta.mkdir(parents=True, exist_ok=True)

    cabecalho = b"\x89PNG\r\n\x1a\n"
    cabecalho += bloco(b"IHDR", pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    pixel = bloco(b"IDAT", compress(bytes((0, 90, 140, 210))))
    fim = bloco(b"IEND", b"")
    chave_texto = b"Teste\x00"
    tamanho_base = len(cabecalho + bloco(b"tEXt", chave_texto) + pixel + fim)

    for tamanho in (2_097_151, 2_097_152, 2_097_153):
        texto = bloco(b"tEXt", chave_texto + b"a" * (tamanho - tamanho_base))
        arquivo = pasta / f"foto-{tamanho}.png"
        arquivo.write_bytes(cabecalho + texto + pixel + fim)
        print(f"{arquivo} ({arquivo.stat().st_size} bytes)")


if __name__ == "__main__":
    gerar_fotos()
