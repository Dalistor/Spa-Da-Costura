import { useNavigation } from '@react-navigation/native';
import { formatBusinessDate } from '../../calendar';
import { formatCents } from '../../money';
import { ListRow, RowFigure } from '../../ui';
import type { Expense } from '../domain';
import { categoryLabels } from './labels';

/** One expense: description, category and date, and its amount at the right. */
export function ExpenseRow({
  expense,
  first,
}: {
  expense: Expense;
  first: boolean;
}) {
  const navigation = useNavigation();
  return (
    <ListRow
      first={first}
      title={expense.description}
      subtitle={`${categoryLabels[expense.category]} · ${formatBusinessDate(expense.date)}`}
      trailing={<RowFigure>{formatCents(expense.amountCents)}</RowFigure>}
      accessibilityHint="Abre a despesa para editar ou excluir"
      onPress={() =>
        navigation.navigate('ExpenseForm', { expenseId: expense.id })
      }
    />
  );
}
