import { interval } from 'rxjs';
import { ObservableConcurrently } from './observable-concurrently';

const concur = new ObservableConcurrently(5);

const lightTask = interval(1000);

const heavyTask = interval(100000);

[heavyTask, heavyTask]
  .concat([...new Array(1000)].map(() => lightTask))
  .forEach((task, i) =>
    concur
      .createTask(() => {
        console.log('executing', i);
        return task;
      })
      .subscribe(result => console.log('done', result))
  );
