import zxcvbn from "zxcvbn";

export enum E_PASSWORD_STRENGTH {
  EMPTY = "empty",
  LENGTH_NOT_VALID = "length_not_valid",
  STRENGTH_NOT_VALID = "strength_not_valid",
  STRENGTH_VALID = "strength_valid",
}
const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_CRITERIA = [
  {
    key: "min_8_char",
    label: "Min 8 characters",
    isCriteriaValid: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
  },
  // {
  //   key: "min_1_upper_case",
  //   label: "Min 1 upper-case letter",
  //   isCriteriaValid: (password: string) => PASSWORD_NUMBER_REGEX.test(password),
  // },
  // {
  //   key: "min_1_number",
  //   label: "Min 1 number",
  //   isCriteriaValid: (password: string) => PASSWORD_CHAR_CAPS_REGEX.test(password),
  // },
  // {
  //   key: "min_1_special_char",
  //   label: "Min 1 special character",
  //   isCriteriaValid: (password: string) => PASSWORD_SPECIAL_CHAR_REGEX.test(password),
  // },
];

export const getPasswordStrength = (pwd: string): E_PASSWORD_STRENGTH => {
  let pwdStrength: E_PASSWORD_STRENGTH = E_PASSWORD_STRENGTH.EMPTY;

  if (!pwd || pwd === "" || pwd.length <= 0) {
    return pwdStrength;
  }

  if (pwd.length >= PASSWORD_MIN_LENGTH) {
    pwdStrength = E_PASSWORD_STRENGTH.STRENGTH_NOT_VALID;
  } else {
    pwdStrength = E_PASSWORD_STRENGTH.LENGTH_NOT_VALID;
  }

  const pwdCriteriaValidation = PASSWORD_CRITERIA.map((criteria) => criteria.isCriteriaValid(pwd)).every(
    (criterion) => criterion
  );

  console.log(zxcvbn(pwd));

  const pwdStrengthScore = zxcvbn(pwd).score;
  if (!pwdCriteriaValidation || pwdStrengthScore <= 2) {
    pwdStrength = E_PASSWORD_STRENGTH.STRENGTH_NOT_VALID;
    return pwdStrength;
  }

  if (pwdCriteriaValidation && pwdStrengthScore >= 3) {
    pwdStrength = E_PASSWORD_STRENGTH.STRENGTH_VALID;
  }

  return pwdStrength;
};
