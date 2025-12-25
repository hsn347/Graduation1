import { Routes, Route } from 'react-router';
import { First_page } from '../pages/First_page';
import { ChatPage } from '@/pages/ChatPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route>
        <Route path="/" element={<First_page />} />
      </Route>
    </Routes>
  );
}
