import { ListTable } from './components/ListTable/ListTable';

function App() {
  return (
    <main className='w-full bg-gray-200 flex justify-center min-h-screen'>
      <div className='w-full max-w-6xl flex justify-center items-center flex-col px-8'>
				<h1 className='text-primary text-3xl mb-2 font-bold'>Listado de tareas</h1>
				<ListTable />
      </div>
    </main>
  )
}

export default App
