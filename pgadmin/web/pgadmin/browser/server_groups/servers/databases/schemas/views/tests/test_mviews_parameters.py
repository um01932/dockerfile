##########################################################################
#
# pgAdmin 4 - PostgreSQL Tools
#
# Copyright (C) 2013 - 2020, The pgAdmin Development Team
# This software is released under the PostgreSQL Licence
#
##########################################################################

import json
import uuid

from pgadmin.browser.server_groups.servers.databases.schemas.tests import \
    utils as schema_utils
from pgadmin.browser.server_groups.servers.databases.tests import utils as \
    database_utils
from pgadmin.utils import server_utils as server_utils
from pgadmin.utils.route import BaseTestGenerator
from regression import parent_node_dict
from regression.python_test_utils import test_utils as utils
from . import utils as views_utils


class MViewsUpdateParameterTestCase(BaseTestGenerator):
    """This class will update the view/mview under schema node."""
    scenarios = [
        ('Enable custom auto vacuum and set the parameters for table',
         dict(url='/browser/mview/obj/', type='set_vacuum_parameters')
         ),
        ('Disable auto vacuum and reset the parameters for table',
         dict(url='/browser/mview/obj/', type='reset_vacuum_parameters')
         ),
        ('Disable custom auto vacuum and reset all the parameters for table',
         dict(url='/browser/mview/obj/', type='reset_all_vacuum_parameters')
         ),
        ('Enable custom auto vacuum and set the toast parameters for table',
         dict(url='/browser/mview/obj/', type='set_toast_parameters')
         ),
        ('Disable auto vacuum and reset the toast parameters for table',
         dict(url='/browser/mview/obj/', type='reset_toast_parameters')
         ),
        ('Disable custom auto vacuum and reset all the toast '
         'parameters for table',
         dict(url='/browser/mview/obj/', type='reset_all_toast_parameters')
         )
    ]

    @classmethod
    def setUpClass(self):
        self.db_name = parent_node_dict["database"][-1]["db_name"]
        schema_info = parent_node_dict["schema"][-1]
        self.server_id = schema_info["server_id"]
        self.db_id = schema_info["db_id"]
        server_response = server_utils.connect_server(self, self.server_id)

        if server_response["data"]["version"] < 90300 and "mview" in self.url:
            message = "Materialized Views are not supported by PG9.2 " \
                      "and PPAS9.2 and below."
            self.skipTest(message)

        db_con = database_utils.connect_database(self, utils.SERVER_GROUP,
                                                 self.server_id, self.db_id)
        if not db_con['data']["connected"]:
            raise Exception("Could not connect to database to update a mview.")
        self.schema_id = schema_info["schema_id"]
        self.schema_name = schema_info["schema_name"]
        schema_response = schema_utils.verify_schemas(self.server,
                                                      self.db_name,
                                                      self.schema_name)
        if not schema_response:
            raise Exception("Could not find the schema to update a mview.")

        self.m_view_name = "test_mview_put_%s" % (str(uuid.uuid4())[1:8])
        m_view_sql = "CREATE MATERIALIZED VIEW %s.%s TABLESPACE pg_default " \
                     "AS SELECT 'test_pgadmin' WITH NO DATA;ALTER TABLE " \
                     "%s.%s OWNER TO %s"

        self.m_view_id = views_utils.create_view(self.server,
                                                 self.db_name,
                                                 self.schema_name,
                                                 m_view_sql,
                                                 self.m_view_name)

    def runTest(self):
        """This function will update the view/mview under schema node."""
        mview_response = views_utils.verify_view(self.server, self.db_name,
                                                 self.m_view_name)
        if not mview_response:
            raise Exception("Could not find the mview to update.")

        data = None
        if self.type == 'set_vacuum_parameters':
            data = dict({'oid': self.m_view_id,
                         'autovacuum_custom': True,
                         'autovacuum_enabled': True,
                         'vacuum_table': dict({'changed': [
                             {'name': 'autovacuum_vacuum_cost_delay',
                              'value': 20},
                             {'name': 'autovacuum_vacuum_threshold',
                              'value': 20}
                         ]})})
        elif self.type == 'reset_vacuum_parameters':
            data = dict({'oid': self.m_view_id,
                         'autovacuum_enabled': False,
                         'vacuum_table': dict({'changed': [
                             {'name': 'autovacuum_vacuum_cost_delay',
                              'value': None},
                             {'name': 'autovacuum_vacuum_threshold',
                              'value': None}
                         ]})})
        elif self.type == 'reset_all_vacuum_parameters':
            data = dict({'oid': self.m_view_id, 'autovacuum_custom': False})
        elif self.type == 'set_toast_parameters':
            data = dict({'oid': self.m_view_id,
                         'autovacuum_custom': True,
                         'autovacuum_enabled': True,
                         'vacuum_toast': dict({'changed': [
                             {'name': 'autovacuum_vacuum_cost_delay',
                              'value': 20},
                             {'name': 'autovacuum_vacuum_threshold',
                              'value': 20}
                         ]})})
        elif self.type == 'reset_toast_parameters':
            data = dict({'oid': self.m_view_id,
                         'autovacuum_enabled': False,
                         'vacuum_toast': dict({'changed': [
                             {'name': 'autovacuum_vacuum_cost_delay',
                              'value': None},
                             {'name': 'autovacuum_vacuum_threshold',
                              'value': None}
                         ]})})
        elif self.type == 'reset_all_toast_parameters':
            data = dict({'oid': self.m_view_id, 'autovacuum_custom': False})

        response = self.tester.put(self.url + str(utils.SERVER_GROUP) + '/' +
                                   str(self.server_id) + '/' +
                                   str(self.db_id) + '/' +
                                   str(self.schema_id) + '/' +
                                   str(self.m_view_id),
                                   data=json.dumps(data),
                                   follow_redirects=True)
        self.assertEquals(response.status_code, 200)

    @classmethod
    def tearDownClass(self):
        # Disconnect the database
        database_utils.disconnect_database(self, self.server_id, self.db_id)
