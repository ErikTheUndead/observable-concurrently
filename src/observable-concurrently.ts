import { defer, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class ObservableConcurrently<T = any> {
  private tasksQueue: (() => Observable<T>)[] = [];
  private tasksActiveCount: number = 0;
  private tasksLimit: number;

  public constructor(tasksLimit: number) {
    if (tasksLimit < 0) {
      throw new Error('Limit cant be lower than 0.');
    }

    this.tasksLimit = tasksLimit;
  }

  private registerTask(handler: (() => Observable<T>)) {
    this.tasksQueue = [...this.tasksQueue, handler];
    this.executeTasks();
  }

  private executeTasks() {
    while (this.tasksQueue.length && this.tasksActiveCount < this.tasksLimit) {
      const task = this.tasksQueue[0];
      this.tasksQueue = this.tasksQueue.slice(1);
      this.tasksActiveCount += 1;
      task().pipe(
        map(result => {
          this.tasksActiveCount -= 1;
          this.executeTasks();

          return result;
        }),
        catchError(error => {
          this.tasksActiveCount -= 1;
          this.executeTasks();

          throw error;
        })
      );
    }
  }

  public createTask(handler: () => Observable<T>): Observable<T> {
    return defer(() => this.registerTask(() => handler()));
  }
}
