
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	// CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { Task } from "../ListTable/ListTable"
import { Loader2 } from "lucide-react"
import { useState } from "react"

const validationSchema = Yup.object().shape({
  name: Yup
    .string()
    .required('Campo requerido'),
  status: Yup
    .string()
    .required('Campo requerido')
})

interface SchemaFormCreate {
  name: string
  status: string
}

interface PropsFormCreate {
	setTasks: React.Dispatch<React.SetStateAction<Task[]>>
	setOpenDialogCreate?: React.Dispatch<React.SetStateAction<boolean>> | undefined
	setOpenDialogEdit?: React.Dispatch<React.SetStateAction<boolean>> | undefined
	taskSelectedToEdit?: Task | null
}
export function FromCreate({ setTasks, setOpenDialogCreate, setOpenDialogEdit, taskSelectedToEdit }: PropsFormCreate) {
	const [error, setError] = useState('')

	const initialFormValues: SchemaFormCreate = {
		name: taskSelectedToEdit ? taskSelectedToEdit.name : '',
		status: taskSelectedToEdit ? taskSelectedToEdit?.done ? 'Finalizada' : 'Por completar' : ''
	}

	const { values, handleSubmit, handleBlur, handleChange, errors, touched, isSubmitting, setSubmitting } = useFormik({
    initialValues: initialFormValues,
    validationSchema,
    onSubmit: values => {
      taskSelectedToEdit ? handleSubmitEdit(values) : handleSubmitCreate(values)
    }
  })

	const handleSubmitCreate = async (values: SchemaFormCreate) => {
		try {
			setSubmitting(true)

			const result = await fetch(`http://localhost:5000/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ name: values.name, done: values.status === 'Finalizada' ? true : false })
			})

			const data = await result.json()
			if(result.status === 201) {
				setTasks((prevTask) => {
					return [...prevTask, data.taskCreated]
				})
				setSubmitting(false)
				setOpenDialogCreate!(false)
			}
		} catch (error) {
			setSubmitting(false)
			setError('A ocurrido un error, intente nuevamente.')
		}
	}

	const handleSubmitEdit = async (values: SchemaFormCreate) => {
		try {
			setSubmitting(true)

			const result = await fetch(`http://localhost:5000/tasks/${taskSelectedToEdit?.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ name: values.name, done: values.status === 'Finalizada' ? true : false })
			})

			const data = await result.json()

			if(result.status === 200) {
				setTasks((prevTask) => {
          return prevTask.map((task) => task.id === taskSelectedToEdit?.id? data.taskUpdated : task)
        })
				setSubmitting(false)
				setOpenDialogEdit!(false)
			}
		} catch (error) {
			setSubmitting(false)
			setError('A ocurrido un error, intente nuevamente.')
		}
	}

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{ taskSelectedToEdit ? 'Editar': 'Crear' } tarea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Tarea</Label>
              <Input 
								id="name" 
								placeholder="Escribe la tarea aqui"  
								onBlur={handleBlur('name')}
              	onChangeCapture={handleChange('name')}
								value={values.name} 
							/>
							<p className="text-red-500 text-sm">{ Boolean(touched.name && errors.name) && 'Debe ingresar el nombre' }</p>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select 
								defaultValue={`${values.status}`}  
              	onValueChange={handleChange('status')}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Estatus de la tarea" />
                </SelectTrigger>
                <SelectContent position="popper" >
                  <SelectItem value={"Finalizada"}>Finalizada</SelectItem>
                  <SelectItem value={"Por completar"}>Por completar</SelectItem>
                </SelectContent>
              </Select>
							<p className="text-red-500 text-sm">{ Boolean(touched.status && errors.status) && 'Debe ingresar el status' }</p>
            </div>
          </div>
        </form>
				{ error && <p className="text-red-500 text-sm">{error}</p> }
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => taskSelectedToEdit ? setOpenDialogEdit!(false) : setOpenDialogCreate!(false)}>Cancelar</Button>
        <Button onClick={() => handleSubmit()}  disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{ taskSelectedToEdit ? 'Editar': 'Crear' }
				</Button>
      </CardFooter>
    </Card>
  )
}
