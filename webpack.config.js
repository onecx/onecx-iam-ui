const { ModifyEntryPlugin } = require('@angular-architects/module-federation/src/utils/modify-entry-plugin')
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack')

const config = withModuleFederationPlugin({
  name: 'onecx-iam-ui',
  filename: 'remoteEntry.js',
  exposes: {
    './OneCXIamModule': 'src/main.ts',
    './OneCXChangePasswordComponent': 'src/app/remotes/change-password/change-password.component.main.ts',
    './OneCXIamUserRolesComponent': 'src/app/remotes/iam-user-roles/iam-user-roles.component.main.ts'
  },
  shared: share({
    '@angular/core': { requiredVersion: 'auto', includeSecondaries: true },
    '@angular/common': { requiredVersion: 'auto', includeSecondaries: { skip: ['@angular/common/http/testing'] } },
    '@angular/common/http': { requiredVersion: 'auto', includeSecondaries: true },
    '@angular/forms': { requiredVersion: 'auto', includeSecondaries: true },
    '@angular/platform-browser': { requiredVersion: 'auto', includeSecondaries: true },
    '@angular/router': { requiredVersion: 'auto', includeSecondaries: true },
    '@ngx-translate/core': { requiredVersion: 'auto' },
    primeng: { requiredVersion: 'auto', includeSecondaries: true },
    rxjs: { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/accelerator': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-accelerator': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-auth': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-integration-interface': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-remote-components': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-testing': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-utils': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/angular-webcomponents': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/integration-interface': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/keycloak-auth': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/portal-integration-angular': { requiredVersion: 'auto', includeSecondaries: true },
    '@onecx/portal-layout-styles': { requiredVersion: 'auto', includeSecondaries: true }
  }),
  sharedMappings: ['@onecx/portal-integration-angular']
})
config.devServer = { allowedHosts: 'all' }

const plugins = config.plugins.filter((plugin) => !(plugin instanceof ModifyEntryPlugin))

module.exports = {
  ...config,
  plugins,
  output: { uniqueName: 'onecx-iam-ui', publicPath: 'auto' },
  experiments: { ...config.experiments, topLevelAwait: true },
  optimization: { runtimeChunk: false, splitChunks: false }
}
