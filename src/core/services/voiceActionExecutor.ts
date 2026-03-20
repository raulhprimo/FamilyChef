import { useMealsStore } from '../../modules/chef/store/mealsStore';
import { useTasksStore } from '../../modules/home/store/tasksStore';
import { useExpensesStore } from '../../modules/fin/store/expensesStore';
import { getWeekId } from '../utils/dates';
import type { VoiceAction } from '../types/voice';

export function executeVoiceAction(action: VoiceAction): void {
  switch (action.module) {
    case 'chef': {
      const date = new Date(action.data.date + 'T12:00:00');
      useMealsStore.getState().addMeal({
        weekId: getWeekId(date),
        date: action.data.date,
        type: action.data.type,
        dish: action.data.dish,
        responsibleIds: action.data.responsibleIds,
        done: false,
      });
      break;
    }
    case 'home': {
      useTasksStore.getState().addInstance({
        name: action.data.name,
        category: action.data.category,
        assignedTo: action.data.assignedTo,
        dueDate: action.data.dueDate,
        priority: action.data.priority,
        done: false,
      });
      break;
    }
    case 'fin': {
      useExpensesStore.getState().addExpense({
        description: action.data.description,
        amount: action.data.amount,
        category: action.data.category,
        paidBy: action.data.paidBy,
        splitBetween: action.data.splitBetween,
        date: action.data.date,
      });
      break;
    }
  }
}
