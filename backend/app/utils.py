from pwdlib import PasswordHash


class Password:
    def __init__(self, password: str):
        self.password = password
        self.password_hash = PasswordHash.recommended()

    def get_hash(self):
        return self.password_hash.hash(self.password)

    def compare_hash(self, hash: str):
        return self.password_hash.verify(self.password, hash)
