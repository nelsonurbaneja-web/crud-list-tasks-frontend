import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { FromCreate } from "../FormCreate/FormCreate"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

export interface Task {
  id: number
  name: string
  done: boolean
  createdAt: string
  updatedAt: string
  projectId: number
}

export interface ResponseApi {
	tasks: Task[]
}

export function ListTable() {
	const { toast } = useToast()
	const [tasks, setTasks] = useState<Task[]>([])
	const [loadingTasks, setLoadingTasks] = useState<boolean>(true)

	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false)
	const [openDialogCreate, setOpenDialogCreate] = useState<boolean>(false)
	const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false)

	const [taskSelectedToDelete, setTaskSelectedToDelete] = useState<Task | null>(null)
	const [taskSelectedToEdit, setTaskSelectedToEdit] = useState<Task | null>(null)
	const [loadingDeleteTask, setLoadingDeleteTask] = useState<boolean>(false)


	useEffect(() => {
		fetch("http://localhost:5000/tasks/")
      .then((res) => res.json())
      .then((data: ResponseApi) => {
				console.log({ takss: data.tasks })
        setTasks(data.tasks)
      }).finally(() => {
				setLoadingTasks(false)
			}) 
	}, [])

	async function deleteTask ({ idTask }: { idTask: number }) {
		try {
			setLoadingDeleteTask(true)
			const result = await fetch(`http://localhost:5000/tasks/${Number(idTask)}`, {
			method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
		})

		console.log({ result })
		if(result.status === 200) {
			toast({
				description: "Tarea eliminada correctamente.",
			})
			setTasks(tasks.filter(task => task.id !== idTask))
			setOpenDialogDelete(false)
			setLoadingDeleteTask(false)
			setTaskSelectedToDelete(null)
		} else {
			toast({
				description: "A ocurrido un error, intente nuevamente.",
			})
			setOpenDialogDelete(true)
			setLoadingDeleteTask(false)
		}
		} catch (error) {
			setLoadingDeleteTask(false)
			console.log({ error})
		}
	}

  return (
		<>
			<div className="w-full py-8 flex justify-end">
				<Button onClick={() => setOpenDialogCreate(true) }>Crear nueva tarea</Button>
			</div>
			<Table className="bg-white rounded-sm">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Id tarea</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Nombre</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{
					loadingTasks ? 'loading'
					: tasks?.map((task) => (
						<TableRow key={task?.id}>
							<TableCell className="font-medium">{task?.id}</TableCell>
							<TableCell>{task?.done === true ? 'Finalizada' : 'Por completar'}</TableCell>
							<TableCell>{task?.name}</TableCell>
							<TableCell className="text-right">
								<div className="flex gap-2 justify-end">
									<Button onClick={() => {
										setTaskSelectedToEdit(task)
										setOpenDialogEdit(true)
									}}>
										Editar
									</Button>
									<Button onClick={() => {
										setTaskSelectedToDelete(task)
										setOpenDialogDelete(true)
									}}>Eliminar</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<AlertDialog defaultOpen={openDialogDelete} open={openDialogDelete ? true: false}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Seguro que desea eliminar esta tarea?</AlertDialogTitle>
						<AlertDialogDescription>
						ESTA ACCION NO SE PODRA REVERTIR
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDialogDelete(false)} disabled={loadingDeleteTask}>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={() => deleteTask({ idTask: taskSelectedToDelete?.id as number })} disabled={loadingDeleteTask}>
							{loadingDeleteTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Si continuar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog defaultOpen={openDialogCreate} open={openDialogCreate ? true: false}>
				<AlertDialogContent>
					<FromCreate setTasks={setTasks} setOpenDialogCreate={setOpenDialogCreate} />
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog defaultOpen={openDialogEdit} open={openDialogEdit ? true: false}>
				<AlertDialogContent>
					<FromCreate 
						setTasks={setTasks} 
						setOpenDialogCreate={setOpenDialogCreate} 
						setOpenDialogEdit={setOpenDialogEdit} 
						taskSelectedToEdit={taskSelectedToEdit}
					/>
				</AlertDialogContent>
			</AlertDialog>
		</>
  )
}