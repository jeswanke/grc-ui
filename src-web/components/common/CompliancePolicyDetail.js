/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Loading } from 'carbon-components-react'
import { connect } from 'react-redux'
import StructuredListModule from '../../components/common/StructuredListModule'
import resources from '../../../lib/shared/resources'
import PolicyTemplates from '../../components/common/PolicyTemplates'
import ResourceTableModule from '../../components/common/ResourceTableModuleFromProps'
import { updateSecondaryHeader} from '../../actions/common'
import lodash from 'lodash'
import { RESOURCE_TYPES } from '../../../lib/shared/constants'
import msgs from '../../../nls/platform.properties'
import { Query } from 'react-apollo'
import { HCMPolicy } from '../../../lib/client/queries'

resources(() => {
  require('../../../scss/resource-overview.scss')
})


class CompliancePolicyDetail extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object,
    resourceType: PropTypes.object,
    staticResourceData: PropTypes.object,
    updateSecondaryHeader: PropTypes.func,
  }

  static contextTypes = {
    locale: PropTypes.string
  }

  constructor (props) {
    super(props)
  }

  componentWillMount() {
    const { updateSecondaryHeader, params} = this.props
    // details page mode
    if (params) {
      updateSecondaryHeader(this.getPolicyName(), null, this.getBreadcrumb())
    }
  }

  getPolicyName() {
    const { location } = this.props,
          urlSegments = location.pathname.split('/')
    return urlSegments[urlSegments.length - 2]
  }

  getBreadcrumb() {
    const breadcrumbItems = []
    const {  location, resourceType } = this.props,
          { locale } = this.context,
          urlSegments = location.pathname.split('/')

    // Push only one breadcrumb to overview page
    if (resourceType.name === RESOURCE_TYPES.HCM_COMPLIANCES.name) {
      breadcrumbItems.push({
        label: msgs.get('tabs.hcmcompliance', locale),
        url: urlSegments.slice(0, 3).join('/')
      })
    }
    return breadcrumbItems
  }

  render() {
    const url = lodash.get(this.props, 'match.url')
    const urlSegments = url.split('/')
    const policyName = urlSegments[urlSegments.length - 2]
    const policyNamespace = urlSegments[urlSegments.length - 1]
    const {staticResourceData, params, resourceType} = this.props
    return (
      <Query query={HCMPolicy} variables={{name: policyName, clusterName: policyNamespace}}>
        {({ data, loading }) => {
          if (loading) {
            return (<Loading withOverlay={false} className='content-spinner' />)
          }
          const policy = data.policies[0], modulesRight = [], modulesBottom = []
          React.Children.map([
            <PolicyTemplates key='Policy Templates' headerKey='table.header.policyTemplate' right />,
            <ResourceTableModule key='roleTemplates' definitionsKey='policyRoleTemplates' />,
            <ResourceTableModule key='roleBindingTemplates' definitionsKey='policyRoleBindingTemplates' />,
            <ResourceTableModule key='objectTemplates' definitionsKey='policyObjectTemplates' />,
            <ResourceTableModule key='policyTemplates' definitionsKey='policyPolicyTemplates' />,
            <ResourceTableModule key='rules' definitionsKey='policyRules' />,
            <ResourceTableModule key='violations' definitionsKey='policyViolations' />], module => {
            if (module.props.right) {
              modulesRight.push(React.cloneElement(module, { staticResourceData: staticResourceData, resourceType: resourceType, resourceData: policy, params }))
            } else {
              modulesBottom.push(React.cloneElement(module, { staticResourceData: staticResourceData, resourceType: resourceType, resourceData: policy, params }))
            }
          })
          return (
            <div className='overview-content'>
              <StructuredListModule
                title={staticResourceData.policyDetailKeys.title}
                headerRows={staticResourceData.policyDetailKeys.headerRows}
                rows={staticResourceData.policyDetailKeys.rows}
                data={policy} />
              {modulesRight.length > 0 &&
                <div className='overview-content-right'>
                  {modulesRight}
                </div>}
              <div className='overview-content-bottom'>
                {modulesBottom}
              </div>
            </div>
          )
        }}
      </Query>

    )
  }
}

const mapStateToProps = () => {
  return {}
}


const mapDispatchToProps = (dispatch) => {
  return {
    updateSecondaryHeader: (title, tabs, breadcrumbItems, links) => dispatch(updateSecondaryHeader(title, tabs, breadcrumbItems, links))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CompliancePolicyDetail))
