import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Grid, createStyles, Text, Checkbox, Button, PasswordInput, Loader, Progress, MultiSelect, Modal, Title } from '@mantine/core';
import { authApi } from '../api';
import FormInputWrapperComponent from '../components/FormInputWrapper';
import { getStrength, PasswordRequirement, requirements } from '../components/Password';
import { SERVER_DOWN } from '../constants/messages';
import MultiSelectComponent from '../components/MultiSearch';
import {Button as MUIButton} from '@mui/material'
import SelectComponent from '../components/Select';

type FormInputType = {
	email: string;
	lastName: string;
	password: string;
	firstName: string;
	type: string;
	age: string;
	gender: string;
	location: string;
};

type SignUpMutationType = {
	expectedMateAge: string[];
	expectedVisitingPlaces: string[];
	travelLocationsPreference: string[];
	genderPreference: string[];
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	type: string;
	age: string;
	gender: string;
	location: string;
	religion: string;
	personQty: string;
	ridePreference: string[];
};

type SignInMutationResponse = {
	AccessToken: string;
	ExpiresIn: number;
	IdToken: string;
	RefreshToken: string;
	TokenType: string;
};

type ErrorFields = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	type: string;
	age: string;
	gender: string;
	location: string;
};

type ErrorFieldsType = [...[keyof ErrorFields]];

const useStyles = createStyles(() => ({
	container: {
		height: '101vh',
		width: '100%',
	},
	showCaseSide: {
		backgroundColor: '#228be6',
	},
	rootSignUpContainer: {
		paddingLeft: '35px',
		paddingRight: '20px',
	},
	merchFlowTitleContainer: {
		marginTop: '25px',
		height: '80px',
	},
	merchFlowTitle: {
		color: '#228be6',
		fontSize: '30px',
	},
	signUpTitleContainer: {
		height: '40px',
	},
	alertInfoContainer: {
		height: 'auto',
		marginBottom: '7px',
	},
	signUpTitle: {
		fontSize: '30px',
		color: '#00000099 !important',
	},
	SignUpContainer: {
		height: 'auto',
		padding: '10px',
	},
	checkbox: {
		color: '#228be6',
	},
	haveAccountContainer: {
		maxWidth: 'unset',
	},
	haveAccount: {
		fontSize: '15px',
		color: '#00000099 !important',
		cursor: 'pointer',
	},
	signUpBtnContainer: {
		marginTop: '20px',
		display: 'flex',
		flexDirection: 'column',
		width: '90%',
	},
	logInSpan: {
		color: '#228be6',
	},
	industryNumber: {
		marginTop: '0px',
		marginBottom: '0px',
		color: '#00000099 !important',
		fontSize: '15px',
		textAlign: 'start',
		marginLeft: '10px',
	},
	industryNumberDesc: {
		fontSize: '12px',
		textAlign: 'start',
		marginLeft: '10px',
	},
	inputWrapper: {
		label: {
			color: '#00000099 !important',
		},
	},
}));

const SignUp = () => {
	const { classes } = useStyles();
	const router = useRouter();
	const [expectedVisitingPlaces, setExpectedVisitingPlaces] = useState([]);
	const [expectedMateAge ,setExpectedMateAge] = useState([]);
	const [travelLocationsPreference ,setTravelLocationsPreference] = useState([]);
	const [genderPreference, setGenderPreference] = useState([]);
	const [religion, setReligion] = useState('');
	const [personQty, setPersonQty] = useState('');
	const [error, setError] = useState({
		error: false,
		message: '',
	});
	const [errorFields, setErrorFields] = useState<ErrorFieldsType>();
	const [checked, setChecked] = useState(false);
	const { register, handleSubmit, formState, setValue } = useForm<FormInputType>({
		mode: 'onChange',
	});
	const [additionalFilters, setAdditionalFilterOpen] = useState(false);
	const [ridePreference, setRidePreference] = useState([]);

	const [password, setPassword] = useState('');
	const strength = getStrength(password);
	const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
	const checks = requirements.map((requirement, index) => (
		<PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
	));

	const signUpMutation = useMutation('signUp', async (variables: SignUpMutationType) => {
		return await authApi.signUp({
			path: 'auth/signUp',
			...variables,
		});
	});

	const onSubmit: SubmitHandler<FormInputType> = async (formData) => {

		let { firstName, lastName, email, password, type, age, gender, location } = formData;

		if (firstName && lastName && password && email && checked) {

			const signupData: SignUpMutationType = { firstName, lastName, email, password, type, age, gender, location, expectedMateAge,  expectedVisitingPlaces, travelLocationsPreference, genderPreference, religion, personQty, ridePreference};

			await signUpMutation.mutateAsync(
				{ ...signupData, expectedVisitingPlaces, expectedMateAge, travelLocationsPreference, genderPreference },
				{
					onSuccess: (data) => {
						setError({
							error: false,
							message: '',
						});
						const signInResponse: SignInMutationResponse = data.data.AuthenticationResult;
						localStorage.setItem('accessToken', signInResponse.AccessToken);
						localStorage.setItem('idToken', signInResponse.IdToken);

						setTimeout(() => {
							router.push('/app/admin');
						}, 2000);
					},
					onError: (err: any) => {
						if (err?.response?.data === undefined) {
							setError({
								error: true,
								message: SERVER_DOWN,
							});
						} else {
							if (!!err?.response.data?.zodError) {
								setErrorFields(err?.response.data?.errorFields);
							} else {
								setErrorFields(undefined);
								setError(err?.response.data);
							}
						}
					},
				}
			);
		}
	};

	return (
		<Grid className={classes.container}>
			<Grid.Col span={6} className={classes.showCaseSide} />
			<Grid.Col span={6} className={classes.rootSignUpContainer}>
				<Grid.Col span={12} className={classes.merchFlowTitleContainer}>
					<Text component="span" align="center" size="xl" weight={700} className={classes.merchFlowTitle}>
					Travelmate
					</Text>
				</Grid.Col>
				<Grid.Col span={12} className={classes.signUpTitleContainer}>
					<Text component="span" align="center" size="xl" weight={700} className={classes.signUpTitle}>
						Sign Up
					</Text>
				</Grid.Col>
				<Grid.Col span={12} className={classes.alertInfoContainer}>
					{!!error?.error && <span style={{ color: 'red' }}>{error.message}</span>}
				</Grid.Col>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid className={classes.SignUpContainer}>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="First Name"
								name="firstName"
								placeholder="Enter your first name"
								required={true}
								className={classes.inputWrapper}
								register={register}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Last Name"
								name="lastName"
								required={true}
								placeholder="Enter your last name"
								className={classes.inputWrapper}
								register={register}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Email"
								name="email"
								required={true}
								placeholder="Enter your email"
								className={classes.inputWrapper}
								register={register}
								pattern="/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/"
								error={
									!!errorFields?.includes('email')
										? 'Email is not valid'
										: formState.errors.email?.type === 'pattern'
										? 'Email must be valid'
										: ''
								}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Type"
								name="type"
								required={true}
								placeholder="Enter your type"
								className={classes.inputWrapper}
								register={register}
								error={
									!!errorFields?.includes('type')
										? 'type is not valid'
										: formState.errors.email?.type === 'pattern'
										? 'type must be valid'
										: ''
								}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Age"
								name="age"
								required={true}
								placeholder="Enter your age"
								className={classes.inputWrapper}
								register={register}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Gender"
								name="gender"
								required={true}
								placeholder="Enter your gender"
								className={classes.inputWrapper}
								register={register}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<FormInputWrapperComponent
								label="Traveler Location"
								name="location"
								required={true}
								placeholder="Enter your location"
								className={classes.inputWrapper}
								register={register}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<MultiSelectComponent
								cdata={[
									{ label: 'United States', value: 'United States' },
									{ label: 'Great Britain', value: 'Great Britain' },
									{ label: 'Pakistan', value: 'Pakistan' }
								  ]}
								label={'Expected places'}
								placeholder={'choose expected places to visit'}
								handleChange={(data: any) => setExpectedVisitingPlaces(data)}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<MultiSelectComponent
								cdata={[
									{ label: 'above 10 below 20', value: '10' },
									{ label: 'above 20 below 30', value: '20' },
									{ label: 'above 30 below 40', value: '30' },
									{ label: 'above 40 below 50', value: '40' },
									{ label: 'above 50 below 60', value: '50' }
								  ]}
								label={'Mate Age Requirements'}
								placeholder={'choose expected age of traveler'}
								handleChange={(data: any) => setExpectedMateAge(data)}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<MultiSelectComponent
								cdata={[
									{ label: 'local', value: 'local' },
									{ label: 'international', value: 'international' },
								  ]}
								label={'Location preference'}
								placeholder={'choose travel location preference'}
								handleChange={(data: any) => setTravelLocationsPreference(data)}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<MultiSelectComponent
								cdata={[
									{ label: 'male', value: 'male' },
									{ label: 'female', value: 'female' },
								  ]}
								label={'Gender Preference'}
								placeholder={'choose gender preference'}
								handleChange={(data: any) => setGenderPreference(data)}
							/>
						</Grid.Col>
						
						<Grid.Col span={6}>
							<PasswordInput
								placeholder="Enter your password"
								label="password"
								required
								className={classes.inputWrapper}
								onChange={(event) => {
									setPassword(event.target.value);
									setValue('password', event.target.value);
								}}
							/>
							{!!password.length ? (
								<>
									<Progress color={color} value={strength} size={5} style={{ marginBottom: 10 }} />
									<PasswordRequirement
										label="Includes at least 6 characters"
										meets={password.length > 5}
									/>
									{checks}
								</>
							) : (
								''
							)}
						</Grid.Col>
						<Grid.Col span={6}>
							<MUIButton variant='outlined' onClick={() => setAdditionalFilterOpen(true)}>
								<a>
                  					More Filters Addition
								</a>
							</MUIButton>
						</Grid.Col>
						<Modal
							opened={additionalFilters}
							onClose={() => {
								setAdditionalFilterOpen(false)
							}}
							centered={true}
							title={
								<Title order={3}>More Filters</Title>
							}
							size="calc(30%)"
						>
							<Grid>
								<Grid.Col span={12}>
									<SelectComponent
										data={['Muslim', 'Christianity', 'Hinduism']}
										label={'Religion'}
										placeholder={'Select Religion'}
										handleChange={(data: any) => setReligion(data)}
									/>
								</Grid.Col>
								<Grid.Col span={12}>
									<SelectComponent
										data={['1', '2', '3', '4', '5']}
										label={'How many Persons'}
										placeholder={'Expected Persons'}
										handleChange={(data: any) => setPersonQty(data)}
									/>
								</Grid.Col>
								<Grid.Col span={12}>
									<MultiSelectComponent
										cdata={[
											{ label: 'bike', value: 'bike' },
											{ label: 'car', value: 'car' },
											{ label: 'bus', value: 'bus' },
											{ label: 'airplane', value: 'airplane' },
										]}
										label={'Select Ride'}
										placeholder={'choose ride preference'}
										handleChange={(data: any) => setRidePreference(data)}
									/>
								</Grid.Col>
								<Grid.Col span={12}>
									<Button onClick={() => setAdditionalFilterOpen(false)}>
										Apply
									</Button>
								</Grid.Col>
							</Grid>
						</Modal>
						<Grid.Col span={6}></Grid.Col>
						<Grid.Col span={6}>
							<Grid className={classes.signUpBtnContainer}>
								<Grid.Col span={12}>
									<Checkbox
										label={
											<>
												Accept{' '}
												<Text
													component="a"
													href="/terms"
													target="_blank"
													className={classes.logInSpan}
												>
													{' '}
													Terms & Conditions{' '}
												</Text>
											</>
										}
										className={classes.checkbox}
										checked={checked}
										onChange={(event) => setChecked(event.currentTarget.checked)}
									/>
								</Grid.Col>
								<Grid.Col span={12}>
									<Button
										fullWidth
										type="submit"
										disabled={!formState.isValid || !checked || strength !== 100}
									>
										{signUpMutation.isLoading ? (
											<Loader color="white" variant="dots" size="lg" />
										) : (
											'Sign Up'
										)}
									</Button>
								</Grid.Col>
								<Grid.Col span={12} className={classes.haveAccountContainer}>
									<Text
										component="a"
										align="center"
										weight={500}
										className={classes.haveAccount}
										href={'/login'}
									>
										Already have an account? <span className={classes.logInSpan}>Log In</span>
									</Text>
								</Grid.Col>
							</Grid>
						</Grid.Col>
					</Grid>
				</form>
			</Grid.Col>
		</Grid>
	);
};

export default SignUp;
