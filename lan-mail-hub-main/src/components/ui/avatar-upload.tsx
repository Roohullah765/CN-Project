import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload = ({ value, onChange, className, size = 'lg' }: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-4 border-card shadow-soft')}>
        <AvatarImage src={preview || undefined} alt="Profile" />
        <AvatarFallback className="bg-accent text-accent-foreground">
          <User className={size === 'lg' ? 'h-12 w-12' : 'h-6 w-6'} />
        </AvatarFallback>
      </Avatar>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 rounded-full shadow-soft h-8 w-8"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
