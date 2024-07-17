import { getExpenses } from "app/actions";
import AddNewExpenseButton from "../client/AddNewExpense";
import EditExpense from "../client/EditExpense";
import moment from "moment";
import DeleteExpense from "../client/DeleteExpense";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AssignExpense from "../client/AssignExpense";
import { Expense } from "@/lib/utils";
import { Card } from "@/components/ui/card";


export default async function Expenses({groupId, session, currentMember}: { groupId: string, session: any, currentMember: any}) {
    const expenses: Expense[] = await getExpenses(groupId);
    const data: any[] = expenses.filter(expense => expense.status !== 'removed');
    const isReadOnly = currentMember.role === 'read';
    const isAdmin = currentMember.role === 'admin';

    return (
        <Card className="px-6 pb-6">
            <div className="flex justify-between items-center gap-2 my-4">
                <h3 className="text-xl font-semibold leading-none tracking-tight my-4">Expenses</h3>
                {!isReadOnly && <AddNewExpenseButton groupId={groupId} session={session} />}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Description</TableHead>
                        <TableHead className="text-center">Value</TableHead>
                        <TableHead className="text-center">Member</TableHead>
                        <TableHead className="text-center">Location</TableHead>
                        <TableHead className="text-center">Asignados</TableHead>
                        <TableHead className="text-center"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((expense, index) => {
                        const isYourExpense = expense.member_id == currentMember.member_id;
                        return (
                            <TableRow key={index}>
                                <TableCell className="text-center">{moment(expense.date).format('L')}</TableCell>
                                <TableCell className="text-center font-medium">{expense.description}</TableCell>
                                <TableCell className="text-center font-medium">{expense.currency} {expense.value}</TableCell>
                                <TableCell className="text-center font-medium">{expense.nickname}</TableCell>
                                <TableCell className="text-center font-medium">{expense.location}</TableCell>
                                <TableCell className="text-center font-medium break-words max-w-[150px]">
                                    {expense.members.map((member: string, index: any, array: any) => 
                                        `${member}${array.length - 1 !== index ? ', ' : ''}`
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(isAdmin || isYourExpense) && !isReadOnly && expense.status === 'pending' ? 
                                    <>   
                                        <AssignExpense groupId={groupId} expense={expense} />
                                        <EditExpense expense={expense} />
                                    </> : null
                                    }
                                    {(isAdmin || isYourExpense) && !isReadOnly ? 
                                        <DeleteExpense groupId={groupId} expenseId={expense.id} /> : null
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    )
}