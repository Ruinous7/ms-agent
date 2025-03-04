import Link from 'next/link';
import { Megaphone, Users, Target, FileText, BarChart3 } from 'lucide-react';

export default function ActionsPage() {
  const actions = [
    {
      id: 'marketing-messages',
      title: 'מסרים שיווקיים',
      description: 'יצירת מסרים שיווקיים מותאמים אישית לעסק שלך',
      icon: <Megaphone className="h-6 w-6" />,
      href: '/protected/actions/marketing-messages',
    },
    {
      id: 'target-audience',
      title: 'קהלי יעד',
      description: 'זיהוי קהלי היעד המדויקים לעסק שלך',
      icon: <Users className="h-6 w-6" />,
      href: '/protected/actions/target-audience',
    },
    {
      id: 'business-goals',
      title: 'יעדים עסקיים',
      description: 'הגדרת יעדים ברורים ומדידים להצלחת העסק',
      icon: <Target className="h-6 w-6" />,
      href: '/protected/actions/business-goals',
    },
    {
      id: 'marketing-plan',
      title: 'תוכנית שיווק',
      description: 'פיתוח אסטרטגיית שיווק מותאמת אישית לעסק שלך',
      icon: <FileText className="h-6 w-6" />,
      href: '/protected/actions/marketing-plan',
    },
    {
      id: 'post-generator',
      title: 'יצירת פוסטים',
      description: 'יצירת פוסטים לרשתות חברתיות בהתאמה אישית',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/protected/actions/post-generator',
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">פעולות שיווקיות</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <Link 
            key={action.id} 
            href={action.href}
            className="bg-card dark:bg-card hover:bg-accent/50 dark:hover:bg-accent/20 rounded-lg shadow-md p-6 transition-colors border border-border"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-primary/10 rounded-full text-primary mr-3">
                {action.icon}
              </div>
              <h2 className="text-xl font-semibold">{action.title}</h2>
            </div>
            <p className="text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 