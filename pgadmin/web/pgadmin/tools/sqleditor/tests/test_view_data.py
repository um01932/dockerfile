##########################################################################
#
# pgAdmin 4 - PostgreSQL Tools
#
# Copyright (C) 2013 - 2020, The pgAdmin Development Team
# This software is released under the PostgreSQL Licence
#
##########################################################################

import uuid
import json
import random

from pgadmin.utils.route import BaseTestGenerator
from pgadmin.browser.server_groups.servers.databases.tests import utils as \
    database_utils
from regression import parent_node_dict
from regression.python_test_utils import test_utils
from pgadmin.utils import server_utils, IS_PY2


class TestViewData(BaseTestGenerator):
    """
    This class checks the view data result for a table with JSON datatype
    """
    skip_on_database = ['gpdb']
    scenarios = [
        (
            'Table with JSON datatype',
            dict(
                table_sql="""Create Table <TABLE_NAME>(
                id integer Not Null,
                json_val json Not Null,
                Constraint table_pk Primary Key(id)
                );""",
                result_data='SELECT 0',
                rows_fetched_to=0
            )
        )
    ]

    def setUp(self):
        self.server_id = self.server_information['server_id']
        self.database_info = parent_node_dict["database"][-1]
        self.db_name = self.database_info["db_name"]
        self.db_id = self.database_info["db_id"]

        self.connection = test_utils.get_db_connection(
            self.db_name,
            self.server['username'],
            self.server['db_password'],
            self.server['host'],
            self.server['port']
        )

    def runTest(self):
        self.table = "test_table_%s" % (str(uuid.uuid4())[1:8])
        self.table_sql = self.table_sql.replace('<TABLE_NAME>', self.table)
        # Create table
        test_utils.create_table_with_query(self.server,
                                           self.db_name,
                                           self.table_sql)

        # Fetch Table OID
        pg_cursor = self.connection.cursor()
        pg_cursor.execute("""Select oid FROM pg_class WHERE
         relname = '%s' AND relkind IN ('r','s','t')""" % self.table)

        result = pg_cursor.fetchall()
        table_id = result[0][0]

        # Initialize query tool
        self.trans_id = str(random.randint(1, 9999999))
        url = '/datagrid/initialize/datagrid/{0}/3/table/{1}/{2}/{3}/{4}'\
            .format(self.trans_id, test_utils.SERVER_GROUP, self.server_id,
                    self.db_id, table_id)
        response = self.tester.post(url)

        self.assertEquals(response.status_code, 200)

        url = "/sqleditor/view_data/start/{0}".format(self.trans_id)
        response = self.tester.get(url)
        self.assertEquals(response.status_code, 200)

        # Check the query result
        url = '/sqleditor/poll/{0}'.format(self.trans_id)
        response = self.tester.get(url)
        self.assertEquals(response.status_code, 200)
        response_data = json.loads(response.data.decode('utf-8'))

        self.assertEquals(response_data['data']['result'], self.result_data)
        self.assertEquals(response_data['data']['rows_fetched_to'],
                          self.rows_fetched_to)

    def tearDown(self):
        database_utils.disconnect_database(self, self.server_id,
                                           self.db_id)
