import Link from 'next/link';
import { EllipsisVertical, ShoppingCartIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SheetDescription,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  Sheet,
} from '@/components/ui/sheet';
import ModeToggle from './mode-toggle';

const Menu = () => {
  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        <Button asChild variant={'ghost'}>
          <Link href={'/cart'}>
            <ShoppingCartIcon /> Cart
          </Link>
        </Button>
        <Button asChild>
          <Link href={'/sign-in'}>
            <UserIcon /> Sign In
          </Link>
        </Button>
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start p-4'>
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button asChild variant={'ghost'}>
              <Link href={'/cart'}>
                <ShoppingCartIcon /> Cart
              </Link>
            </Button>
            <Button asChild>
              <Link href={'/sign-in'}>
                <UserIcon /> Sign In
              </Link>
            </Button>
            <SheetDescription />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
