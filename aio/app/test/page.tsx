export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Teste - Netlify Deploy</h1>
      <p>Se você está vendo esta página, o Next.js está funcionando no Netlify!</p>
      <p>Data/Hora: {new Date().toLocaleString('pt-BR')}</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Voltar para Home
      </a>
    </div>
  )
} 