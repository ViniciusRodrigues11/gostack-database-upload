import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const transactionBalance = getCustomRepository(TransactionRepository);

    let findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = await categoryRepository.create({
        title: category,
      });

      findCategory = await categoryRepository.save(findCategory);
    }

    const balance = await transactionBalance.getBalance();

    if (type === 'outcome') {
      if (balance.total - value < 0) {
        throw new AppError('Outcome exceds total value', 400);
      }
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });

    const createTransaction = await transactionRepository.save(transaction);

    return createTransaction;
  }
}

export default CreateTransactionService;
