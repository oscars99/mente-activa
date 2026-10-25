import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExerciseRunner } from '../components/ExerciseRunner';
import { FocusLayout } from '../components/Layout';
import { EXERCISE_IDS, type ExerciseId } from '../lib/types';

/** Free practice of a single exercise, outside the daily plan. */
export function ExercisePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!EXERCISE_IDS.includes(id as ExerciseId)) return <Navigate to="/" replace />;

  return (
    <FocusLayout>
      <ExerciseRunner
        key={id}
        exercise={id as ExerciseId}
        onFinish={() => navigate('/')}
        onExit={() => navigate('/')}
      />
    </FocusLayout>
  );
}
