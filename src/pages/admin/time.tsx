import ReportsTable from '@/components/ReportsTable';
import Projects from '@/constants/projects.enum';
import Report from '@/interfaces/report.interface';
import AdminLayout from '@/layouts/AdminLayout';
import useReportsStore from '@/stores/reports.store';
import useTimeStore from '@/stores/time.store';
import parseDuration from '@/utils/parseDuration';
import {
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  TableContainer,
  TextField,
  Typography,
} from '@material-ui/core';
import { isToday } from 'date-fns';
import { useEffect, useState } from 'react';

const Time: React.FC = () => {
  const [descriptionError, setDescriptionError] = useState<string>(``);
  const [projectError, setProjectError] = useState<string>(``);
  const [reportsToday, setReportsToday] = useState<Report[]>([]);

  const {
    timer,
    updateTimer,
    currentDescription,
    updateDescription,
    currentProject,
    updateProject,
    startDate,
    updateStartDate,
    lastDuration,
    updateLastDuration,
    currentDuration,
    incrementDuration,
    clearCurrentDuration,
    getTotalDuration,
  } = useTimeStore();
  const { reports, addReport } = useReportsStore();

  useEffect(() => {
    if (reports.length > 0 && reportsToday.length === 0) {
      const d = reports.filter((r) => isToday(r.startDate));
      setReportsToday(d);

      if (
        d.length > 0 &&
        lastDuration.hours === 0 &&
        lastDuration.minutes === 0 &&
        lastDuration.seconds === 0
      )
        updateLastDuration(
          d
            .map((r) => r.duration)
            .reduce((p, c) => ({
              hours: p.hours + c.hours,
              minutes: p.minutes + c.minutes,
              seconds: p.seconds + c.seconds,
            })),
        );
    }
  }, [reports, reportsToday, lastDuration]);

  const handleButton = (): void => {
    setDescriptionError(``);
    setProjectError(``);

    if (timer) {
      clearInterval(timer);
      updateTimer(null);

      if (currentProject && startDate) {
        const rep: Report = {
          project: currentProject,
          description: currentDescription,
          startDate,
          endDate: new Date(Date.now()),
          duration: currentDuration,
        };

        addReport(rep);
        setReportsToday((current) => [...current, rep]);

        updateProject(null);
        updateStartDate(null);
      }

      updateDescription(``);
      updateLastDuration(getTotalDuration());
      clearCurrentDuration();
      return;
    }

    if (!currentDescription.length) {
      setDescriptionError(`Debes ingresar una descripción.`);
      return;
    }

    if (!currentProject) {
      setProjectError(`Debes seleccionar un proyecto.`);
      return;
    }

    updateTimer(setInterval(() => incrementDuration(), 1000));
    updateStartDate(new Date(Date.now()));
  };

  return (
    <AdminLayout title="Tiempo">
      <Grid container spacing={1} justify="center">
        <Grid item xs={12}>
          <Grid container spacing={1} alignItems="center" justify="center">
            <Grid item md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Descripción"
                value={currentDescription}
                defaultValue={currentDescription}
                onChange={(e) => updateDescription(e.target.value)}
                error={descriptionError.length > 0}
                helperText={descriptionError}
              />
            </Grid>
            <Grid item md={4}>
              <Select
                fullWidth
                variant="outlined"
                value={currentProject}
                defaultValue={currentProject}
                onChange={(e) => updateProject(e.target.value as Projects)}
                error={projectError.length > 0}
              >
                {Object.entries(Projects).map(([key, value]) => (
                  <MenuItem value={value}>{key}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleButton()}
              >
                {!timer ? `Comenzar` : `Detener`}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography align="center">
            Tiempo total de hoy: {parseDuration(getTotalDuration())}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {reportsToday.length > 0 ? (
            <TableContainer component={Paper}>
              <ReportsTable withProject reports={reportsToday} />
            </TableContainer>
          ) : (
            <Typography align="center">Aún no has trabajado hoy.</Typography>
          )}
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default Time;
