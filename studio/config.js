// Conexão do app com o banco de dados (Supabase).
// Aqui ficam só o endereço e a chave PÚBLICA (anon), que é feita para ficar no navegador:
// a segurança vem do login e das regras de acesso (RLS) — cada conta só lê os próprios registros,
// e só o e-mail da GR Visual pode criar conta. A chave secreta nunca fica neste repositório.
window.GR_SUPABASE = {
  url: "https://wgyvrvaswgudncimvpva.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneXZydmFzd2d1ZG5jaW12cHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNDEzNDMsImV4cCI6MjEwNzkxNzM0M30.MVJeK--UOhVG8liG8QwqQAAA9tf5OwS4K1zuM0RtS0A"
};
