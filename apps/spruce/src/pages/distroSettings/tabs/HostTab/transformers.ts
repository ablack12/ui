import { DistroSettingsTabRoutes } from "constants/routes";
import { FormToGqlFunction, GqlToFormFunction } from "../types";

type Tab = DistroSettingsTabRoutes.Host;

export const gqlToForm = ((data) => {
  if (!data) return null;

  const {
    arch,
    authorizedKeysFile,
    bootstrapSettings: {
      clientDir,
      communication,
      env,
      jasperBinaryDir,
      jasperCredentialsPath,
      method,
      preconditionScripts,
      resourceLimits,
      rootDir,
      serviceUser,
      shellPath,
    },
    execUser,
    homeVolumeSettings,
    hostAllocatorSettings,
    iceCreamSettings,
    isVirtualWorkStation,
    mountpoints,
    setup,
    setupAsSudo,
    sshOptions,
    user,
    userSpawnAllowed,
    workDir,
  } = data;

  return {
    setup: {
      bootstrapMethod: method,
      communicationMethod: communication,
      arch,
      workDir,
      setupAsSudo,
      setupScript: setup,
      rootDir,
      userSpawnAllowed,
      isVirtualWorkStation,
      icecreamSchedulerHost: iceCreamSettings.schedulerHost,
      icecreamConfigPath: iceCreamSettings.configPath,
      mountpoints: mountpoints ?? [],
    },
    bootstrapSettings: {
      jasperBinaryDir,
      jasperCredentialsPath,
      clientDir,
      shellPath,
      serviceUser,
      homeVolumeFormatCommand: homeVolumeSettings.formatCommand,
      resourceLimits,
      env,
      preconditionScripts,
    },
    sshConfig: {
      user,
      execUser,
      authorizedKeysFile,
      sshOptions,
    },
    allocation: hostAllocatorSettings,
  };
  // @ts-expect-error: FIXME. This comment was added by an automated script.
}) satisfies GqlToFormFunction<Tab>;

export const formToGql = ((
  { allocation, bootstrapSettings, setup, sshConfig },
  distro,
  // @ts-expect-error: FIXME. This comment was added by an automated script.
) => ({
  ...distro,
  arch: setup.arch,
  authorizedKeysFile: sshConfig.authorizedKeysFile,
  bootstrapSettings: {
    clientDir: bootstrapSettings.clientDir,
    communication: setup.communicationMethod,
    env: bootstrapSettings.env,
    jasperBinaryDir: bootstrapSettings.jasperBinaryDir,
    jasperCredentialsPath: bootstrapSettings.jasperCredentialsPath,
    method: setup.bootstrapMethod,
    preconditionScripts: bootstrapSettings.preconditionScripts,
    resourceLimits: bootstrapSettings.resourceLimits,
    rootDir: setup.rootDir,
    serviceUser: bootstrapSettings.serviceUser,
    shellPath: bootstrapSettings.shellPath,
  },
  homeVolumeSettings: {
    formatCommand: bootstrapSettings.homeVolumeFormatCommand,
  },
  hostAllocatorSettings: allocation,
  iceCreamSettings: {
    configPath: setup.icecreamConfigPath,
    schedulerHost: setup.icecreamSchedulerHost,
  },
  isVirtualWorkStation: setup.isVirtualWorkStation,
  setupAsSudo: setup.setupAsSudo,
  setup: setup.setupScript,
  mountpoints: setup.mountpoints,
  sshOptions: sshConfig.sshOptions,
  user: sshConfig.user,
  execUser: sshConfig.execUser,
  userSpawnAllowed: setup.userSpawnAllowed,
  workDir: setup.workDir,
})) satisfies FormToGqlFunction<Tab>;
