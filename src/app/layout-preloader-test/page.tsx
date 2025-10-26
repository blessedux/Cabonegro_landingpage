import { redirect } from 'next/navigation';

export default function LayoutPreloaderTestRedirect() {
  // Redirect to the locale-specific layout preloader test page
  redirect('/en/layout-preloader-test');
}
