import { CategoryProvider } from './context/CategoryContext'
import CategoryBar from './components/CategoryBar'
import VideoFeed from './components/VideoFeed'

export default function App() {
  return (
    <CategoryProvider>
      <div className="relative h-dvh w-full overflow-hidden bg-black text-white">
        <CategoryBar />
        <VideoFeed />
      </div>
    </CategoryProvider>
  )
}
