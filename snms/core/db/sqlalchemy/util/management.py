from __future__ import unicode_literals

from sqlalchemy import ForeignKeyConstraint, MetaData, Table
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.sql.ddl import DropConstraint, DropSchema, DropTable
from werkzeug.security import generate_password_hash
from prompt_toolkit import prompt

# from snms.core.db.sqlalchemy.protection import ProtectionMode
from snms.utils.console import cformat


DEFAULT_TEMPLATE_DATA = {
    'background_position': 'stretch', 'width': 850, 'height': 1350, 'items': [
        {'font_size': '24pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'center', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 190, 'x': 330,
         'height': None, 'type': 'event_title', 'id': 0},
        {'font_size': '15pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'left', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 50, 'x': 50,
         'height': None, 'type': 'event_dates', 'id': 1},
        {'font_size': '15pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'left', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 350, 'x': 230,
         'height': None, 'type': 'affiliation', 'id': 2},
        {'font_size': '15pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'left', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 310, 'x': 230,
         'height': None, 'type': 'full_name_b', 'id': 3},
        {'font_size': '13.5pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': True,
         'text_align': 'left', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 130, 'x': 50,
         'height': None, 'type': 'event_venue', 'id': 4},
        {'font_size': '15pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'center', 'font_family': 'sans-serif', 'width': 150, 'italic': False, 'y': 270, 'x': 50,
         'height': 150, 'type': 'ticket_qr_code', 'id': 5},
        {'font_size': '13.5pt', 'bold': False, 'color': 'black', 'text': 'Fixed text', 'selected': False,
         'text_align': 'left', 'font_family': 'sans-serif', 'width': 400, 'italic': False, 'y': 90, 'x': 50,
         'height': None, 'type': 'event_room', 'id': 6}]
}


def get_all_tables(db):
    """Returns a dict containing all tables grouped by schema"""
    inspector = Inspector.from_engine(db.engine)
    schemas = sorted(set(inspector.get_schema_names()) - {'information_schema'})
    return dict(zip(schemas, (inspector.get_table_names(schema=schema) for schema in schemas)))


def delete_all_tables(db):
    """Drops all tables in the database"""
    conn = db.engine.connect()
    transaction = conn.begin()
    inspector = Inspector.from_engine(db.engine)
    metadata = MetaData()

    all_schema_tables = get_all_tables(db)
    tables = []
    all_fkeys = []
    for schema, schema_tables in all_schema_tables.items():
        for table_name in schema_tables:
            fkeys = [ForeignKeyConstraint((), (), name=fk['name'])
                     for fk in inspector.get_foreign_keys(table_name, schema=schema)
                     if fk['name']]
            tables.append(Table(table_name, metadata, *fkeys, schema=schema))
            all_fkeys.extend(fkeys)

    for fkey in all_fkeys:
        conn.execute(DropConstraint(fkey))
    for table in tables:
        conn.execute(DropTable(table))
    for schema in all_schema_tables:
        if schema != 'public':
            row = conn.execute("""
                SELECT 'DROP FUNCTION ' || ns.nspname || '.' || proname || '(' || oidvectortypes(proargtypes) || ')'
                FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
                WHERE ns.nspname = '{}'  order by proname;
            """.format(schema))
            for stmt, in row:
                conn.execute(stmt)
            conn.execute(DropSchema(schema))
    transaction.commit()


def create_all_tables(db, verbose=False, add_initial_data=True):
    """Create all tables and required initial objects"""
    from snms.modules.settings.operations import add_default_settings
    if verbose:
        print(cformat('%{green}Creating tables'))
    db.create_all()
    if verbose:
        print(cformat('%{green}Tables, created'))
    if add_initial_data:
        if verbose:
            print(cformat('%{green}Adding default settings'))
        add_default_settings()