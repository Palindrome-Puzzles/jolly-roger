/* eslint-disable max-len, jsx-a11y/anchor-is-valid, jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useTracker } from 'meteor/react-meteor-data';
import React, { useCallback, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import styled from 'styled-components';
import TeamName from '../team_name';

export enum AccountFormFormat {
  LOGIN = 'login',
  REQUEST_PW_RESET = 'requestPwReset',
  ENROLL = 'enroll',
  RESET_PWD = 'resetPwd',
}

// Styles originally taken from https://git.io/vupVU

const StyledForm = styled.div`
  float: none;
  margin: auto;
  overflow: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  padding: 15px;
`;

const StyledTitle = styled.h3`
  margin-top: 0px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
`;

const StyledModeSwitchLink = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const NoPaddingLinkButton = styled(Button)`
  padding: 0px;
  vertical-align: baseline;
`;

type AccountFormProps = {
  format: AccountFormFormat.LOGIN | AccountFormFormat.REQUEST_PW_RESET;
  onFormatChange: () => void;
} | {
  format: AccountFormFormat.ENROLL | AccountFormFormat.RESET_PWD;
  token: string;
}

enum AccountFormSubmitState {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  FAILED = 'failed',
  SUCCESS = 'success',
}

const AccountForm = (props: AccountFormProps) => {
  const loading = useSubscribe('teamName');
  const teamName = useTracker(() => {
    return TeamName.findOne('teamName')?.name ?? 'Default Team Name';
  }, []);

  const [submitState, setSubmitState] = useState<AccountFormSubmitState>(AccountFormSubmitState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const setEmailCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  }, []);
  const setPasswordCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  }, []);
  const setDisplayNameCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.currentTarget.value);
  }, []);
  const setPhoneNumberCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.currentTarget.value);
  }, []);
  const toggleWantPasswordReset = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (props.format === AccountFormFormat.LOGIN || props.format === AccountFormFormat.REQUEST_PW_RESET) {
      props.onFormatChange();
    }
  }, [props]);

  const tryLogin = useCallback(() => {
    setSubmitState(AccountFormSubmitState.SUBMITTING);
    Meteor.loginWithPassword(email, password, (error?: Error) => {
      if (error) {
        setSubmitState(AccountFormSubmitState.FAILED);
        setErrorMessage((error instanceof Meteor.Error) ? error.reason : error.message);
      } else {
        setSubmitState(AccountFormSubmitState.SUCCESS);
        setSuccessMessage('Logged in successfully.');
      }
    });
  }, [email, password]);

  const tryPasswordReset = useCallback(() => {
    setSubmitState(AccountFormSubmitState.SUBMITTING);
    Accounts.forgotPassword({ email }, (error?: Error) => {
      if (error) {
        setSubmitState(AccountFormSubmitState.FAILED);
        setErrorMessage((error instanceof Meteor.Error) ? error.reason : error.message);
      } else {
        setSubmitState(AccountFormSubmitState.SUCCESS);
        setSuccessMessage('Password reset email sent.');
      }
    });
  }, [email]);

  const tryCompletePasswordReset = useCallback((token: string) => {
    setSubmitState(AccountFormSubmitState.SUBMITTING);
    Accounts.resetPassword(token, password, (error?: Error) => {
      if (error) {
        setSubmitState(AccountFormSubmitState.FAILED);
        setErrorMessage((error instanceof Meteor.Error) ? error.reason : error.message);
      } else {
        setSubmitState(AccountFormSubmitState.SUCCESS);
        setSuccessMessage('Password reset successfully');
      }
    });
  }, [password]);

  const tryEnroll = useCallback((token: string) => {
    const newProfile = {
      displayName,
      phoneNumber,
      muteApplause: false,
      dingwords: [],
    };

    setSubmitState(AccountFormSubmitState.SUBMITTING);
    Accounts.resetPassword(token, password, (error?: Error) => {
      if (error) {
        setSubmitState(AccountFormSubmitState.FAILED);
        setErrorMessage((error instanceof Meteor.Error) ? error.reason : error.message);
      } else {
        Meteor.call('saveProfile', newProfile, (innerError?: Error) => {
          if (innerError) {
            // This user will have to set their profile manually later.  Oh well.
            setSubmitState(AccountFormSubmitState.FAILED);
            setErrorMessage((innerError instanceof Meteor.Error) ? innerError.reason : innerError.message);
          } else {
            setSubmitState(AccountFormSubmitState.SUCCESS);
            setSuccessMessage('Created account successfully');
          }
        });
      }
    });
  }, [displayName, phoneNumber, password]);

  const submitFormCallback = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    switch (props.format) {
      case AccountFormFormat.LOGIN:
        tryLogin();
        break;
      case AccountFormFormat.REQUEST_PW_RESET:
        tryPasswordReset();
        break;
      case AccountFormFormat.ENROLL:
        tryEnroll(props.token);
        break;
      case AccountFormFormat.RESET_PWD:
        tryCompletePasswordReset(props.token);
        break;
      default:
    }
  }, [tryLogin, tryPasswordReset, tryEnroll, tryCompletePasswordReset, props]);

  if (loading()) {
    return <div>loading...</div>;
  }

  // I'm mimicking the DOM used by AccountTemplates for this form so I can reuse their CSS.  It
  // would probably be good to refactor this to use ReactBootstrap/additional styles directly and
  // drop AccountTemplates entirely.
  const submitting = submitState === AccountFormSubmitState.SUBMITTING;
  const title = {
    [AccountFormFormat.LOGIN]: `Jolly Roger: ${teamName} Virtual HQ`,
    [AccountFormFormat.ENROLL]: 'Create an Account',
    [AccountFormFormat.REQUEST_PW_RESET]: 'Reset your password',
    [AccountFormFormat.RESET_PWD]: 'Reset your password',
  }[props.format];

  const buttonText = {
    [AccountFormFormat.LOGIN]: 'Sign In',
    [AccountFormFormat.ENROLL]: 'Register',
    [AccountFormFormat.REQUEST_PW_RESET]: 'Email Reset Link',
    [AccountFormFormat.RESET_PWD]: 'Set Password',
  }[props.format];

  const emailInput = (
    <Form.Group controlId="at-field-email">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect="off"
        onChange={setEmailCallback}
        disabled={submitting}
      />
    </Form.Group>
  );
  const pwInput = (
    <Form.Group controlId="at-field-password">
      <Form.Label>Password</Form.Label>
      <Form.Control
        type="password"
        placeholder="Password"
        autoCapitalize="none"
        autoCorrect="off"
        onChange={setPasswordCallback}
        disabled={submitting}
      />
    </Form.Group>
  );
  const enrollmentFields = [
    <Form.Group controlId="at-field-displayname">
      <Form.Label>Full name</Form.Label>
      <Form.Control
        type="text"
        placeholder="Ben Bitdiddle"
        autoCapitalize="none"
        autoCorrect="off"
        onChange={setDisplayNameCallback}
        disabled={submitting}
      />
      <Form.Text>For use in chat</Form.Text>
    </Form.Group>,
    <Form.Group controlId="at-field-phonenumber">
      <Form.Label>Phone Number</Form.Label>
      <Form.Control
        type="tel"
        placeholder="+16173244699"
        onChange={setPhoneNumberCallback}
        disabled={submitting}
      />
      <Form.Text>
        Optional, but helpful if HQ needs to reach you while you&apos;re
        on a runaround or at an event puzzle.
      </Form.Text>
    </Form.Group>,
  ];
  const pwResetOptionComponent = props.format === AccountFormFormat.LOGIN ? (
    <div>
      <p>
        <NoPaddingLinkButton variant="link" onClick={toggleWantPasswordReset}>
          Forgot your password?
        </NoPaddingLinkButton>
      </p>
    </div>
  ) : null;
  const backToMainForm = props.format === AccountFormFormat.REQUEST_PW_RESET ? (
    <StyledModeSwitchLink>
      <p>
        If you already have an account,
        {' '}
        <NoPaddingLinkButton variant="link" onClick={toggleWantPasswordReset}>
          sign in
        </NoPaddingLinkButton>
      </p>
    </StyledModeSwitchLink>
  ) : null;
  return (
    <StyledForm>
      <StyledTitle>{title}</StyledTitle>
      <div>
        <form noValidate action="#" method="POST" onSubmit={submitFormCallback}>
          <fieldset>
            {submitState === AccountFormSubmitState.FAILED ? <Alert variant="danger">{errorMessage}</Alert> : null}
            {submitState === AccountFormSubmitState.SUCCESS && successMessage ? <Alert variant="success">{successMessage}</Alert> : null}
            {props.format === AccountFormFormat.LOGIN || props.format === AccountFormFormat.REQUEST_PW_RESET ? emailInput : null}
            {props.format === AccountFormFormat.LOGIN || props.format === AccountFormFormat.ENROLL || props.format === AccountFormFormat.RESET_PWD ? pwInput : null}
            {pwResetOptionComponent}
            {props.format === AccountFormFormat.ENROLL ? enrollmentFields : null}
            <Button size="lg" variant="outline-secondary" block type="submit" disabled={submitting}>
              {buttonText}
            </Button>
            {backToMainForm}
          </fieldset>
        </form>
      </div>
    </StyledForm>
  );
};

export default AccountForm;
