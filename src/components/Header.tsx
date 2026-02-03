import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Receipt, CreditCard, Tags, Calendar, User, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddBill: () => void;
}

const navItems = [
  { label: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { label: 'Transações', href: '/transacoes', icon: Receipt },
  { label: 'Cartões de crédito', href: '/cartoes', icon: CreditCard },
  { label: 'Minhas Categorias', href: '/categorias', icon: Tags },
  { label: 'Agenda', href: '/agenda', icon: Calendar },
];

export function Header({ onAddBill }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">$</span>
              </div>
              <span className="font-semibold text-lg">Minhas Contas</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.href
                      ? "text-background"
                      : "text-background/70 hover:text-background"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={onAddBill}
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            >
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
            <div className="flex items-center gap-3 text-sm">
              <button className="flex items-center gap-1 text-background/70 hover:text-background transition-colors">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Minha Conta</span>
              </button>
              <span className="text-background/30">|</span>
              <button className="flex items-center gap-1 text-background/70 hover:text-background transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
