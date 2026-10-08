import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-6 font-sans">
      <Link href="/" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-[10px] bg-[#00E676] flex items-center justify-center text-white font-bold text-xl shadow-sm">
          G
        </div>
        <span className="font-bold text-[22px] text-gray-900 tracking-tight">Grana Smart</span>
      </Link>
      
      <div className="w-full max-w-[420px] bg-white border border-gray-100 p-8 sm:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Acesse sua conta</h1>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Senha</label>
            <input 
              type="password" 
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex justify-end pt-1">
            <Link href="#" className="text-sm text-[#00E676] font-medium hover:underline">Esqueci minha senha</Link>
          </div>
          
          <div className="pt-2">
            <Link href="/dashboard" className="block w-full">
              <button 
                type="button" 
                className="w-full h-12 bg-[#00E676] hover:bg-[#00C853] text-white font-bold text-lg rounded-lg transition-colors shadow-sm"
              >
                Entrar
              </button>
            </Link>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Não tem uma conta? <Link href="/cadastro" className="text-[#00E676] hover:underline">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
