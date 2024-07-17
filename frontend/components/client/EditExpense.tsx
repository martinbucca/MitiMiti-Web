'use client';

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { Button } from "../ui/button";
import { editExpense } from "app/actions";
import { FormState, Expense } from "@/lib/utils";
import moment from "moment";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function EditExpense(props: {expense: Expense|any}) {
    const expense = props.expense;
    const [isModalOpen, setModalOpen] = useState(false);

    const [state, action] = useFormState((prevState: FormState, formData: FormData) =>
        editExpense(prevState, formData, expense.id), {
        message: "",
    });

    useEffect(() => {
        if (state.message === "success") {
            setModalOpen(false);
        }
    }, [state]);

    const [currencies, setCurrencies] = useState([]);
    useEffect(() => {
        fetch('http://localhost:8000/currencies')
            .then(response => response.json())
            .then(data => setCurrencies(data));
    }, []);

    return (
        <>
            <Button className="me-2" onClick={() => setModalOpen(true)}>Edit</Button>
            {isModalOpen && (
                <div id="modal" className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-left">
                        <form action={action}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">Edit Expense</h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-800 dark:text-gray-200 text-3xl">&times;</button>
                            </div>
                            <div className="mt-4">
                                <h5></h5>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
                                <input type="date" name="date" id="date" required defaultValue={moment(expense.date).format('YYYY-MM-DD')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                                <input type="text" name="description" id="description" placeholder="Description" required defaultValue={expense.description} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>
                            <div className="flex flex-row mt-4">
                                <div className="lg:me-2">
                                    <label htmlFor="currency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency:</label>
                                    <select name="currency_id" id="currency_id" required defaultValue={expense.currency_id} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                                        <option value="">Currency</option>
                                        {currencies.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.currency + ' (' + c.country + ')'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value:</label>
                                    <input type="number" name="value" id="value" placeholder="Value" required defaultValue={expense.value} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location:</label>
                                <input type="text" name="location" id="location" placeholder="Location" required defaultValue={expense.location} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>

                            {state.message !== "success" &&
                                <p className="mt-4 text-red-600">{state.message}</p>
                            }

                            <div className="mt-6 flex gap-2">
                                <input type="hidden" id="expense_id" name="expense_id" defaultValue={expense.id} />

                                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Confirm</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}