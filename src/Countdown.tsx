import React from "react";

interface CountdownProps {
  now: Date;
  startTime: Date | null;
  endTime: Date | null;
}

interface CountdownDetails {
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
}

const calculateCountdown = (now: Date, endTime: Date): CountdownDetails => {
  let msRemaining = endTime.getTime() - now.getTime();

  const secondInMs = 1000;
  const minuteInMs = secondInMs * 60;
  const hourInMs = minuteInMs * 60;
  const dayInMs = hourInMs * 24;

  const daysRemaining = Math.floor(msRemaining / dayInMs);
  msRemaining -= daysRemaining * dayInMs;

  const hoursRemaining = Math.floor(msRemaining / hourInMs);
  msRemaining -= hoursRemaining * hourInMs;

  const minutesRemaining = Math.floor(msRemaining / minuteInMs);
  msRemaining -= minutesRemaining * minuteInMs;

  const secondsRemaining = Math.floor(msRemaining / secondInMs);

  return {
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
  };
};

export default (props: CountdownProps) => {
  if (props.startTime == null || props.endTime == null) {
    return null;
  }

  const countdownCompleted = props.now.getTime() >= props.endTime.getTime();

  if (countdownCompleted) {
    return (
      <span role="img" aria-label="party popper">
        🎉🎉🎉
      </span>
    );
  }

  const countdownDetails = calculateCountdown(props.now, props.endTime);

  return (
    <>
      {`${countdownDetails.daysRemaining}d ${countdownDetails.hoursRemaining}h
      ${countdownDetails.minutesRemaining}m ${countdownDetails.secondsRemaining}s`}
    </>
  );
};
