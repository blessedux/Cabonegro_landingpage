import { redirect } from 'next/navigation';

export default function PreloaderTestRedirect() {
  // Redirect to the locale-specific preloader test page
  redirect('/en/preloader-test');
}